<?php
// paperapi.php -- HotCRP paper-related API calls
// Copyright (c) 2008-2022 Eddie Kohler; see LICENSE.

class PaperApi {
    /** @return Contact */
    static function get_user(Contact $user, Qrequest $qreq) {
        $u = $user;
        if (isset($qreq->u) || isset($qreq->reviewer)) {
            $x = isset($qreq->u) ? $qreq->u : $qreq->reviewer;
            if ($x === ""
                || strcasecmp($x, "me") == 0
                || ($user->contactId > 0 && $x == $user->contactId)
                || strcasecmp($x, $user->email) == 0) {
                $u = $user;
            } else if (ctype_digit($x)) {
                $u = $user->conf->user_by_id(intval($x), USER_SLICE);
            } else {
                $u = $user->conf->user_by_email($x, USER_SLICE);
            }
            if (!$u) {
                error_log("PaperApi::get_user: rejecting user {$x}, requested by {$user->email}");
                if ($user->isPC) {
                    JsonResult::make_error(404, "<0>User not found")->complete();
                } else {
                    JsonResult::make_permission_error()->complete();
                }
            }
        }
        return $u;
    }

    /** @param ?PaperInfo $prow */
    static function get_reviewer(Contact $user, $qreq, $prow) {
        $u = self::get_user($user, $qreq);
        if ($u->contactId !== $user->contactId
            && ($prow ? !$user->can_administer($prow) : !$user->privChair)) {
            error_log("PaperApi::get_reviewer: rejecting user {$u->contactId}/{$u->email}, requested by {$user->contactId}/{$user->email}");
            JsonResult::make_permission_error()->complete();
        }
        return $u;
    }

    /** @param ?PaperInfo $prow */
    static function follow_api(Contact $user, $qreq, $prow) {
        $reviewer = self::get_reviewer($user, $qreq, $prow);
        $following = friendly_boolean($qreq->following);
        if ($following === null) {
            return ["ok" => false, "error" => "Bad `following`"];
        }
        $bits = Contact::WATCH_REVIEW_EXPLICIT | ($following ? Contact::WATCH_REVIEW : 0);
        $user->conf->qe("insert into PaperWatch set paperId=?, contactId=?, watch=? on duplicate key update watch=(watch&~?)|?",
            $prow->paperId, $reviewer->contactId, $bits,
            Contact::WATCH_REVIEW_EXPLICIT | Contact::WATCH_REVIEW, $bits);
        return ["ok" => true, "following" => $following];
    }

    static function review_api(Contact $user, Qrequest $qreq, PaperInfo $prow) {
        if (!$user->can_view_review($prow, null)) {
            return JsonResult::make_permission_error();
        }
        $need_id = false;
        if (isset($qreq->r)) {
            $rrow = $prow->full_review_by_ordinal_id($qreq->r);
            if (!$rrow && $prow->parse_ordinal_id($qreq->r) === false) {
                return JsonResult::make_error(400, "<0>Bad request");
            }
            $rrows = $rrow ? [$rrow] : [];
        } else if (isset($qreq->u)) {
            $need_id = true;
            $u = self::get_user($user, $qreq);
            $rrows = $prow->full_reviews_by_user($u);
            if (!$rrows
                && $user->contactId !== $u->contactId
                && !$user->can_view_review_identity($prow, null)) {
                return JsonResult::make_permission_error();
            }
        } else {
            $prow->ensure_full_reviews();
            $rrows = $prow->reviews_as_display();
        }
        $vrrows = [];
        $rf = $user->conf->review_form();
        foreach ($rrows as $rrow) {
            if ($user->can_view_review($prow, $rrow)
                && (!$need_id || $user->can_view_review_identity($prow, $rrow))) {
                $vrrows[] = $rf->unparse_review_json($user, $prow, $rrow);
            }
        }
        if (!$vrrows && $rrows) {
            return JsonResult::make_permission_error();
        } else {
            return new JsonResult(["ok" => true, "reviews" => $vrrows]);
        }
    }

    static function reviewrating_api(Contact $user, Qrequest $qreq, PaperInfo $prow) {
        if (!$qreq->r) {
            return JsonResult::make_error(400, "<0>Bad request");
        }
        $rrow = $prow->full_review_by_ordinal_id($qreq->r);
        if (!$rrow && $prow->parse_ordinal_id($qreq->r) === false) {
            return JsonResult::make_error(400, "<0>Bad request");
        } else if (!$user->can_view_review($prow, $rrow)) {
            return JsonResult::make_permission_error();
        } else if (!$rrow) {
            return JsonResult::make_error(404, "<0>Review not found");
        }
        $editable = $user->can_rate_review($prow, $rrow);
        if ($qreq->method() !== "GET") {
            if (!isset($qreq->user_rating)
                || ($rating = ReviewInfo::parse_rating($qreq->user_rating)) === null) {
                return JsonResult::make_error(400, "<0>Bad request");
            } else if (!$editable) {
                return JsonResult::make_permission_error();
            }
            if ($rating === 0) {
                $user->conf->qe("delete from ReviewRating where paperId=? and reviewId=? and contactId=?", $prow->paperId, $rrow->reviewId, $user->contactId);
            } else {
                $user->conf->qe("insert into ReviewRating set paperId=?, reviewId=?, contactId=?, rating=? on duplicate key update rating=?", $prow->paperId, $rrow->reviewId, $user->contactId, $rating, $rating);
            }
            $rrow = $prow->fresh_review_by_id($rrow->reviewId);
        }
        $rating = $rrow->rating_by_rater($user);
        $jr = new JsonResult(["ok" => true, "user_rating" => $rating]);
        if ($editable) {
            $jr->content["editable"] = true;
        }
        if ($user->can_view_review_ratings($prow, $rrow)) {
            $jr->content["ratings"] = array_values($rrow->ratings());
        }
        return $jr;
    }

    /** @param PaperInfo $prow */
    static function reviewround_api(Contact $user, $qreq, $prow) {
        if (!$qreq->r) {
            return JsonResult::make_error(400, "<0>Bad request");
        }
        $rrow = $prow->full_review_by_ordinal_id($qreq->r);
        if (!$rrow && $prow->parse_ordinal_id($qreq->r) === false) {
            return JsonResult::make_error(400, "<0>Bad request");
        } else if (!$user->can_administer($prow)) {
            return JsonResult::make_permission_error();
        } else if (!$rrow) {
            return JsonResult::make_error(404, "<0>Review not found");
        } else {
            $rname = trim((string) $qreq->round);
            $round = $user->conf->sanitize_round_name($rname);
            if ($round === false) {
                return ["ok" => false, "error" => Conf::round_name_error($rname)];
            }
            $rnum = (int) $user->conf->round_number($round, true);
            $user->conf->qe("update PaperReview set reviewRound=? where paperId=? and reviewId=?", $rnum, $prow->paperId, $rrow->reviewId);
            return ["ok" => true];
        }
    }
}
