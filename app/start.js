/**
 * Created by Administrator on 2016/11/3.
 */

var page = require('webpage').create();
var fs = require("fs");
var system = require('system');

page.open('http://qun.qq.com/member.html', function (status) {
    if (status == 'success') {

        page.switchToFrame("login_frame");

        page.onAlert = function (msg) {
            console.log('ALERT: ' + msg);
        };

        setTimeout(function () {
            page.evaluate(function () {
                document.getElementsByClassName("face")[0].click();
            })

            setTimeout(function () {
                page.switchToMainFrame();
                var d = page.evaluate(function (_bkn) {
                    var data = [];
                    $("#changeGroup").click();
                    $(".my-group-list").each(function (index) {
                        if (index == 2) return;
                        $(this).find("li").each(function (index) {
                            var da = {"id": $(this).attr("data-id"), "title": $(this).attr("title")};
                            if ($(this).attr("title").indexOf("布姆") < 0) {
                                return;
                            }
                            $.ajax({
                                async: false,
                                url: "http://qun.qq.com/cgi-bin/qun_mgr/search_group_members",
                                type: "POST",
                                timeout: 5000,
                                data: {bkn: _bkn, st: 0, end: 2000, gc: da.id},
                                beforeSend: function (request) {
                                    request.setRequestHeader("Accept", "application/json");
                                },
                            success: function (json) { //客户端jquery预先定义好的callback函数,成功获取跨域服务器上的json数据后,会动态执行这个callback函数
                                    da.data = eval("(" + json + ")").mems;
                                    data.push(da);
                                },
                                error: function (xhr) {
                                    console.log("----")
                                }
                            })
                        })
                    })
                    return data;
                },system.args[1])


                var group = fs.open("D:\\groups.txt", 'w');
                var mems = fs.open("D:\\mems.txt", 'w');

                // page.render("show.png");

                //转换{id,title,data}
                for (var ditem in d) {
                    writeBody(d[ditem]);
                }

                function writeBody(data) {
                    group.write(data.id + "," + data.title + "," + data.data.length + "\r\n");
                    for (var m in data.data) {
                        var dt = data.data[m];
                        mems.write(data.id + "||" + dt.nick + "||" + dt.uin + "||" + dt.join_time + "||" + dt.last_speak_time + "\r\n");
                    }
                }

                group.close();
                mems.close();
                phantom.exit();
            }, 4000);

        }, 2000);


    }
});