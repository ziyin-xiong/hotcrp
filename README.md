HotCRP Conference Review Software [![Build Status](https://github.com/kohler/hotcrp/actions/workflows/tests.yml/badge.svg)](https://github.com/kohler/hotcrp/actions/workflows/tests.yml)
=================================

HotCRP is awesome software for managing review processes, especially for
academic conferences. It supports paper submission, review and comment
management, rebuttals, and the PC meeting. Its main strengths are flexibility
and ease of use in the review process, especially through smart paper search
and tagging. It has been widely used in computer science conferences and for
internal review processes at several large companies.

Multitrack conferences with per-track deadlines should use other software.

HotCRP is the open-source version of the software running on
[hotcrp.com](https://hotcrp.com). If you want to run HotCRP without setting
up your own server, use hotcrp.com. See its original [repo](https://github.com/kohler/hotcrp) for more detailed README.

Prerequisites
-------------

HotCRP runs on Unix, including Mac OS X. It requires the following
software:

* Nginx, https://nginx.org/ \
  (Or [Apache](https://httpd.apache.org), or another web server that works with PHP)
* PHP version 7.0 or higher, http://php.net/
  - Including MySQL support, php-fpm, and php-intl
* MariaDB, https://mariadb.org/
* Poppler’s version of pdftohtml, https://poppler.freedesktop.org/ (only
  required for format checking)

You may need to install additional packages, such as php73, php73-fpm,
php73-intl, php73-mysqlnd, zip, poppler-utils, and sendmail or postfix.
