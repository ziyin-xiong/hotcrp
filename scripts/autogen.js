/* 自动根据保存的信息生成
 * 供用户填写的问卷
 * 2022/9/8
 */

class info {
    constructor() {
        this.qid = "";
        this.qtype = "";
        this.qbody = "";
        this.qdetail = [];
        this.qproperty = [];
    }
}

// inText: string
// 读入保存的问卷信息并处理成以info为元素的数组
function readText(inText){
    var infoList = [];
    var raw_infoList = inText.split('}{');
    var info_sum = [];
    for (var raw_info of raw_infoList){
        if (raw_info[0]=="{"){
            raw_info = raw_info.slice(1);
        }
        if (raw_info[raw_info.length-1]=="}"){
            raw_info = raw_info.slice(0,raw_info.length-1);
        }
        var raw_ip_parse = raw_info.split("-->");
        var raw_property = raw_ip_parse[1];
        var raw_info_parse = raw_ip_parse[0].split("][");
        var p_info = new info(); 
        for (var i in raw_info_parse){
            var raw_parse = raw_info_parse[i];
            if(raw_parse[0]=="["){
                raw_parse = raw_parse.slice(1);
            }
            if(raw_parse[raw_parse.length-1]=="]"){
                raw_parse = raw_parse.slice(0,raw_parse.length-1);
            }
            switch(i){
            /* id */
                case '0': {
                    p_info.qid = raw_parse;
                    break;
                }
            /* type */
                case '1': {
                    p_info.qtype = raw_parse;
                    break;
                }
            /* body */
                case '2': {
                    p_info.qbody = raw_parse;
                    break;
                }
            /* detail */
                default: {
                    p_info.qdetail.push(raw_parse);
                }
            }
        }
        /* property */
        if (raw_property.includes("][")){
            var raw_property_list = raw_property.split("][");
            for(var raw_parse of raw_property_list){
                if(raw_parse[0]=="["){
                    raw_parse = raw_parse.slice(1);
                }
                if(raw_parse[raw_parse.length-1]=="]"){
                    raw_parse = raw_parse.slice(0,raw_parse.length-1);
                }
                p_info.qproperty.push(raw_parse);
            }
        }
        else{
            var raw_parse = raw_property;
            if(raw_parse[0]=="["){
                raw_parse = raw_parse.slice(1);
            }
            if(raw_parse[raw_parse.length-1]=="]"){
                raw_parse = raw_parse.slice(0,raw_parse.length-1);
            }
            p_info.qproperty.push(raw_parse);
        }
        info_sum.push(p_info);
    }
    return info_sum;
}

/* 根据题干id获取选项id */
function get_idlist(id, optcnt){
    var idlist = "";
    for(let i = 1; i < optcnt; ++i){
        idlist += id + "_" + i + ",";
    }
    idlist += id + "_" + optcnt;
    return idlist;
}

/* 创建一个单选题 */
function create_radio(id, body, detail, property){
    var qtable = "<table><tbody>";
    var idlist = get_idlist(id, detail.length);
    var nec = "false";
    /* property for radio: nec */
    if(property[0].split("=")[0] == "nec"){
        nec = property[0].split("=")[1];
    }
    qtable += `<tr><td id="`+ id + `" qtype="radio"`+ ` idlist="` + idlist + `" nec="` + nec + `">` + body + "</td></tr>";
    var oid = get_id(idlist);
    for (var i in detail){
        qtable += `<tr><td id="` + oid[i] + `" in_id="` + oid[i] + `_in" ob_id="` + oid[i] + `_ob">`;
        qtable += `<input type="radio" id="` + oid[i] + `_in" style="float:left">`;
        qtable += `<div id="` + oid[i] + `_ob">` + detail[i] + `</div></td></tr>`;
    }
    qtable += "</tbody></table>";
    return qtable;
}

/* 创建一个滑动条 */
function create_slider(id, body, detail, property){
    var qtable = "<table><tbody>";
    var idlist = get_idlist(id, detail.length);
    /* properties for slider: nec */
    var nec = "false";
    if(property[0].split("=")[0] == "nec"){
        nec = property[0].split("=")[1];
    }
    var logid = id + "_log";
    qtable += `<tr><td id="`+ id + `" qtype="slider"`+ ` idlist="` + idlist + `" logid="` + logid + `" nec="` + nec + `">` + body + "</td></tr>";
    var oid = get_id(idlist);
    for(var i in detail){
        qtable += `<tr><td id="` + oid[i] + `" sid="` + oid[i] + `_slider" wid="` + oid[i] + `_weight" bid="` + oid[i] + `_body">`;
        qtable += `<div id="` + oid[i] + `_body">` + detail[i] + `</div>`;
        qtable += `<div class="slider"><input type="number" id="` + oid[i] + `_weight" min="0" max="100" value="0" sid="` + oid[i] + `_slider">`;
        qtable += `<input type="range" id="` + oid[i] + `_slider" min="0" max="100" value="0" wid="` + oid[i] + `_weight"></div></td></tr>`;
    }
    qtable += `<tr><td><button id="` + id + `_check" style="fload:left">check</button><div class="error" id="` + logid + `"></div></td></tr>`;
    qtable += `<tr><td><button id="` + id + `_reset">reset</button></td></tr>`;
/* An Example
 *      <tr>
            <td id="slider_1_a" sid="slider_1_a_slider" wid="slider_1_a_weight" bid="slider_1_a_body">
                <div id="slider_1_a_body">
                    A. Wednesday
                </div>
                <div class="slider">
                    <input type="number" id="slider_1_a_weight" min="0" max="100" value="0" sid="slider_1_a_slider">
                    <input type="range" id="slider_1_a_slider" min="0" max="100" value="0" wid="slider_1_a_weight">
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <button id="check" style="float:left">check</button>
                <div class="error" id="slider_1_log"></div>
            </td>
        </tr>
        <tr>
            <td>
                <button id="reset">reset</button>
            </td>
        </tr>
 */
    
    qtable += `</tbody></table>`;
    return qtable;
}

/* 创建一个多选题 */
function create_checkbox(id, body, detail, property){
    var qtable = `<table><tbody>`;
    var idlist = get_idlist(id, detail.length);
    var nec = "false";
    var max_i = 0
    /* properties for checkbox: nec; max */
    if(property[0].split("=")[0] == "nec"){
        nec = property[0].split("=")[1];
    }
    if(property[1].split("=")[0] == "max"){
        max_i = property[1].split("=")[1];
    }
    var oid = get_id(idlist);
    qtable += `<tr><td id="`+ id + `" qtype="checkbox"`+ ` idlist="` + idlist + `" nec="` + nec + `" max="` + max_i +`">` + body + "</td></tr>";
    for (var i in detail){
        qtable += `<tr><td id="` + oid[i] + `" in_id="` + oid[i] + `_in" ob_id="` + oid[i] + `_ob">`;
        qtable += `<input type="checkbox" id="` + oid[i] + `_in" style="float:left">`;
        qtable += `<div id="` + oid[i] + `_ob">` + detail[i] + `</div></td></tr>`;
    }
/*
 * <table>
        <tbody>
            <tr>
                <td id="checkbox_1" qtype="checkbox" idlist="checkbox_1_a,checkbox_1_b,checkbox_1_c" nec="true", max="2">
                    This is a test. May I take your order?
                </td>
            </tr></br>
            <tr>
                <td id="checkbox_1_a" in_id="checkbox_1_a_in" ob_id="checkbox_1_a_ob">
                    <input type="checkbox" style="float:left" id="checkbox_1_a_in">
                    <div id="checkbox_1_a_ob">A. French Fries</div>
                </td>
            </tr></br>
            <tr> 
                <td id="checkbox_1_b" in_id="checkbox_1_b_in" ob_id="checkbox_1_b_ob">
                    <input type="checkbox" style="float:left" id="checkbox_1_b_in">
                    <div id="checkbox_1_b_ob">B. Egg Fried Rice</div>
                </td>
            </tr></br>
            <tr>
                <td id="checkbox_1_c" in_id="checkbox_1_c_in" ob_id="checkbox_1_c_ob">
                    <input type="checkbox" style="float:left" id="checkbox_1_c_in">
                    <div id="checkbox_1_c_ob">C. Pizza</div>
                </td>
            </tr></br>
        </tbody>
    </table>
 */
    qtable += `</tbody></table>`;
    return qtable;
}

/* 创建一个填空题 */
function create_text(id, body, detail, property){
    qtable = `<table><tbody>`;
    text_id = id + "_textarea";
    var nec = "false";
    if(property[0].split("=")[0] == "nec"){
        nec = property[0].split("=")[1];
    }
    qtable += `<tr><td id="`+ id + `" qtype="text"`+ ` text_id="` + text_id + `" nec="` + nec + `">` + body + "</td></tr>";
    qtable += `<tr><td><textarea id="` + text_id + `"></textarea></td></tr></tbody></table>`;
/*
 * <table>
        <tbody>
            <tr> 
                <td id="text_1" qtype="text" text_id="text_1_textarea" nec="true">
                    This is a test. What's your favorite food?
                </td>
            </tr></br>
            <tr>
                <td>
                    <textarea id="text_1_textarea"></textarea>
                </td>
            </tr></br>
        </tbody>
    </table>
 */
    return qtable;
}

function radio_loop(iid, id){
    document.getElementById(iid+"_in").addEventListener("click", function(){
        check_radio(iid+"_in", id);
    });
}

function slider_loop(s_idlist, iid){
    addListener(iid+"_slider", iid+"_weight");
    document.getElementById(iid+"_slider").addEventListener("change", function(){
        process_slider(s_idlist, iid+"_slider")
    });
    document.getElementById(iid+"_weight").addEventListener("change", function(){
        process_weight(s_idlist, iid+"_weight")
    });
}

function generate_form(inText, display_space){ //先生成html主体，再向主体上绑定事件
    form_info = readText(inText);
    qlist = [];
    var qform = "";
    for(var quest_info of form_info){
        qlist.push(quest_info.qid);
        switch(quest_info.qtype){
            case 'radio': {
                qform += create_radio(quest_info.qid, quest_info.qbody, quest_info.qdetail, quest_info.qproperty);
                break;
            }
            case 'slider': {
                qform += create_slider(quest_info.qid, quest_info.qbody, quest_info.qdetail, quest_info.qproperty);
                break;
            }
            case 'checkbox': {
                qform += create_checkbox(quest_info.qid, quest_info.qbody, quest_info.qdetail, quest_info.qproperty);
                break;
            }
            case 'text': {
                qform += create_text(quest_info.qid, quest_info.qbody, quest_info.qdetail, quest_info.qproperty);
                break;
            }
        }
    }
    qstring = "";
    for(var id of qlist){
        qstring += id + ",";
    }
    qstring = qstring.slice(0, qstring.length-1);
    qform += `<button id="submit" idlist="` + qstring + `">submit</button><script src="qtest.js"></script>`;
    /* <button id="submit" idlist="radio_1,slider_1,checkbox_1,text_1">submit</button> */
    console.log(qform);
    display_space.innerHTML = qform; // display_space must be a 'div' or other space
    for(var quest of form_info){
        id = quest.qid;
        qt = document.getElementById(id);
        if(quest.qtype == "slider"){
            s_idlist = qt.getAttribute("idlist");
            for(var iid of get_id(s_idlist)){
                slider_loop(s_idlist, iid);
            }
            document.getElementById(id+"_check").addEventListener("click", function(){
                check(id)
            });
            document.getElementById(id+"_reset").addEventListener("click", function(){
                reset(id)
            });
            break;
        }
        else if(quest.qtype == "radio"){
            for (var iid of get_id(qt.getAttribute("idlist"))){
                radio_loop(iid, id);
            }
        }
    }

    /* Modify this part to debug js-php interface */
    document.getElementById("submit").addEventListener("click", function(){
        $ajax({
            type: "POST",
            url: "../src/save_query.php", //the address of the php file you want to send the parameter to
            // 似乎没有data项？假设传回php的数据的key为text
            ret_text: unparse("submit"),
            success: function(msg){ //modify this pair of functions to see if anything's wrong
                alert("Success: " + msg);
            },
            error: function(msg){
                alert("Error: " + msg);
            }
        })
    });
    return;
}
