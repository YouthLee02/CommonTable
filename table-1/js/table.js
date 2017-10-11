// JavaScript Document
$(function () {
    var dataGrid = function (ele, opt) {
        this.defaults = {
            //colors&fonts
            id: "",
            //请求url
            url: null,
            //表头格式
            columns: null,
            //是否分页
            pagination: false,
            //是否隔行变色
            isoddcolor: false,
            // 是否具有增删改功能
            dohandle: false,
            //是否搜索栏
            searchnation: false,
            //是否选择条数
            choosethe: true,
            //页显示
            pagesize: 5,
            //页索引
            pageindex: 1,
            //总页数
            totalpage: null
        }
        this.settings = $.extend({}, this.defaults, opt);
    }

    dataGrid.prototype = {
        _id: null,
        $this: null,
        PAGE_SIZE: 0,
        list: [],
        init: function () {
            this._id = this.settings.id;
            $this = this;
            this.create();
            this.bindEvent(); //事件
        },
        create: function () {
            //初始化元素
            this.InitializeElement();
            //初始化表头
            this.createTableHead();
            //初始化动态行
            this.createTableBody(1);
            //是否分条
            if(this.settings.choosethe) {
                this.createChoosethe();
            };
            //初始化搜索框
            if(this.settings.searchnation) {
                this.createSearch();
            };
            //选择是否分页
            if (this.settings.pagination) {
                this.createTableFoot();
            };
            // 弹出模态修改框
            if (this.settings.dohandle) {
                // 增删改功能按钮
                this.createHandle();
                // this.createModel();
            }
        },
        bindEvent: function () {
            //添加上一页事件
            this.registerUpPage();
            //添加下一页事件
            this.registerNextPage();
            //添加首页事件
            this.registerFirstPage();
            //添加最后一页事件
            this.registerlastPage();
            //添加跳转事件
            this.registerSkipPage();
            //添加鼠标悬浮事件
            this.registermousehover();
            //添加隔行变色
            this.registerchangebgcolor();
            //添加全选全不选事件
            this.registercheckall();
            //每页条数事件
            this.numberOfBarsClick();
            //排序
            this.toAddSortingClick();
            //搜索
            this.beginYourSearch();
        },
        //初始化元素
        InitializeElement: function () {
            //var id = this.settings.id;
            $("#form1").prepend("<div class=table-head></div>");
            $(".table-head").after("<div class='table-handle'></div>")
            $("#"+this._id).empty().append("<thead><tr></tr></thead><tbody></tbody><TFOOT></TFOOT>");

        },
        //循环加载点击选择分页
        createChoosethe: function() {
            var chooseHtml = "<span class=pagging>";
            chooseHtml += "<div class='layui-form-label fl-le'>每页</div>";
            chooseHtml += "<div class='layui-input-inline fl-le'>";
            chooseHtml += "<select name=rowsOfPage class=rowOf>";
            chooseHtml += "<option value=5>5条</option>";
            chooseHtml += "<option value=10>10条</option>";
            chooseHtml += "<option value=15>15条</option>";
            chooseHtml += "</select>";
            chooseHtml += "</div>";
            chooseHtml += "<div class='export fl-le'>";
            chooseHtml += "<button class='layui-btn click'>导出</button>";
            chooseHtml += "</div>";
            chooseHtml += "</span>";
            $("#form1").find(".table-head").empty().prepend(chooseHtml);
            // 此处div 造成 其他地方引用div 就会加上
        },
        //加载搜索
        createSearch() {
            var searchHtml = "<span class=searchParent><input type=text class=form-search placeholder=请输入姓名或用户名...><span class=input-group-btn><button class=btn type=button>搜索</button></span></span>";

            $("#form1 > div").prepend(searchHtml);
        },
        //循环添加表头
        createTableHead: function () {
            var headcols = this.settings.columns;

            for (var i = 0; i < headcols.length; i++) {
                if (headcols[i].field == 'ck') {
                    $("table[id='" + this._id + "'] thead tr")
                        .append("<th width='50px'><input name='chkall' type='checkbox'></th>");
                }else {
                    if (i != 4) {
                        $("table[id='" + this._id + "'] thead tr")
                            .append("<th width=" + headcols[i].width + " align=" + headcols[i].align + ">"
                                        + headcols[i].title +
                                    "</th>");
                    } else {
                        $("table[id='" + this._id + "'] thead tr")
                            .append("<th class='sort' width=" + headcols[i].width + " align=" + headcols[i].align + ">"
                                        + "<span></span>" + headcols[i].title +
                                    "</th>");
                    }
                }
            }
        },
        //循环添加行
        createTableBody: function (pn, PAGE_SIZE, newlist) {
            // console.log(pn)
            var columns = $this.settings.columns;
            var json = this.getAjaxDate( $this.settings.url, null);
            var pageSize = PAGE_SIZE || $this.settings.pagesize;
            var list;
            var startPage;
            var endPage;
            var rowsdata;
            this.PAGE_SIZE = pageSize;
            list = newlist || json.rows;

            //总页数=向上取整(总数/每页数)
            $this.settings.totalpage = Math.ceil((list.length) / pageSize);
            //开始页数
            startPage = pageSize * (pn - 1);
            //结束页数
            endPage = startPage + pageSize;
            rowsdata = "";

            for (var row = startPage; row < endPage; row++) {
                if (row == list.length) {
                    break;
                }
                rowsdata += "<tr>";
                for (var colindex = 0; colindex < columns.length; colindex++) {
                    if (columns[colindex].field == 'ck') {
                        rowsdata += '<td width="50px" align="center"><input data-id=' + list[row].ID + ' name="chk" type="checkbox"></td>'
                    }else {
                        rowsdata += '<td width=' + columns[colindex].width + ' align=' + columns[colindex].align + '>' + list[row][columns[colindex].field] + '</td>';
                    }
                }
                rowsdata += "</tr>";
            }
            $("table[id='" + this._id + "'] tbody").empty().append(rowsdata);
            $("#currentpageIndex").html(pn);
            this.registermousehover();
        },
        //初始化分页
        createTableFoot: function() {
            var footHtml = "<tr><td>";

            footHtml += "<span id='countPage'>第<font id='currentpageIndex'>1</font>/" + $this.settings.totalpage + "页</span>";
            footHtml += "<span id='firstPage'>首页</span>";
            footHtml += "<span id='UpPage'>上一页</span>";
            footHtml += "<span id='nextPage'>下一页</span>";
            footHtml += "<span id='lastPage'>末页</span>";
            footHtml += "<input type='text'/><span id='skippage'>跳转</span>";

            $("table[id='" + this._id + "'] tfoot").empty().append(footHtml);
            $("table[id='" + this._id + "'] tfoot tr td").attr("colspan", "5");
        },

        // 创建增删改功能按钮
        createHandle: function() {
            var handleClickBtn = "<div class='handle-add'>增加</div>";
            handleClickBtn += "<div class='handle-change'>修改</div>";
            handleClickBtn += "<div class='handle-delete'>删除</div>";

            $("#form1").find(".table-handle").empty().prepend(handleClickBtn);

            var handleAddBtn = $(".handle-add");
            var handleChangeBtn = $(".handle-change");
            var handleDeleteBtn = $(".handle-delete");

            // 增加事件
            handleAddBtn.on("click", $.proxy(this.handleClickAdd, this));
            // 修改事件
            handleChangeBtn.on("click", $.proxy(this.handleClickChange, this));
            // 删除事件
            handleDeleteBtn.on("click", $.proxy(this.handleClickDelete, this));

        },

        // 增加事件
        handleClickAdd: function() {
            this.createAddModel();
        },

        // 增加事件弹框
        createAddModel: function() {
            var headcol = this.settings.columns;

            var writeModel = '<div class="model js-model">';

            writeModel += '<div class="infor js-table">';
            writeModel += '<div class="attr-model"></div>';
            writeModel += '<div class="infor-off">×</div>';
            writeModel += '<div class="infor-add">提交</div>'
            writeModel += '</div>';
            writeModel += '</div>';

            $("body").append(writeModel);

             for (var i = 0; i < headcol.length; i++) {
                 if (headcol[i].field == 'ck' || headcol[i].field == 'write') {

                 }else {
                     $(".attr-model").append("<div class='columns-infor'><div class='columns-attr'>"
                                     + headcol[i].title +
                                 ":</div><input type='text' value='' class='columns-content'/></div>");
                 }
            };

            // 点击 关闭事件
            var inforOffBtn = $(".infor-off");
            inforOffBtn.on("click", $.proxy(this.inforClickOff, this));

            // 点击提交事件
            var inforAddBtn = $(".infor-add");
            inforAddBtn.on("click", $.proxy(this.inforClickAdd, this));
        },

        // 点击提交
        inforClickAdd: function() {
            var columnsContent = [];
            var columns = $this.settings.columns;
            var columnsCon = $(".columns-content");

            for(var i = 0; i < columnsCon.length; i++) {
                columnsContent.push(columnsCon.eq(i).val())
            };
            console.log(columnsContent.length);
            console.log(columnsCon.val());

            if(columnsCon.val() == "" ) {
                alert("请填写内容");
                return;
            }else {
                var addNewTable = "<tr>"
                addNewTable += '<td width="50px" align="center"><input name="chk" type="checkbox"></td>'
                for(var j = 0; j < columnsContent.length; j++) {
                    addNewTable += '<td width=' + columns[j+1].width + ' align=' + columns[j+1].align + '>'
                                    + columnsContent[j] +
                                '</td>';
                }
                addNewTable += "</tr>";
                $("table tbody").append(addNewTable);
            }

            // 提交后 弹出框关闭
            $(".model").hide();
            console.log(columnsContent);
        },

        // 点击关闭 弹出框关闭
        inforClickOff: function() {
            $(".model").hide()
        },

        // 修改事件
        handleClickChange: function() {
            // 创建修改事件弹框
            this.createChangeModel();
        },

        // 创建修改事件弹框
        createChangeModel: function() {
            var headcol = this.settings.columns;
            var inforChange = [];
            var getInfor = $('#dg').find('input[type=checkbox]:checked').nextAll();
            // console.log(getInfor.length)

            for( var i = 0 ; i < getInfor.length; i++) {
                inforChange.push(getINfor.eq(i).html())
            }
            console.log(inforChange);


            var writeModel = '<div class="model js-model">';

            writeModel += '<div class="infor js-table">';
            writeModel += '<div class="attr-model"></div>';
            writeModel += '<div class="infor-off">×</div>';
            writeModel += '<div class="infor-change">提交</div>'
            writeModel += '</div>';
            writeModel += '</div>';

            $("body").append(writeModel);

            // if($("input[name='chk']").attr("checked", true)) {
            //     alert(aa)
            // };

            for (var i = 0; i < headcol.length; i++) {
                if (headcol[i].field == 'ck' || headcol[i].field == 'write') {

                }else {
                    $(".attr-model").append("<div class='columns-infor'><div class='columns-attr'>"
                                    + headcol[i].title +
                                ":</div><input type='text' value='' class='columns-content'/></div>");
                }
           };

            // 点击 关闭事件
            var inforOffBtn = $(".infor-off");
            inforOffBtn.on("click", $.proxy(this.inforClickOff, this));

            // 点击提交事件
            var inforChangeBtn = $(".infor-change");
            inforChangeBtn.on("click", $.proxy(this.inforClickChange, this));
        },

        // 修改事件的提交
        inforClickChange: function() {
            alert(1111);
        },

        // 删除事件
        handleClickDelete: function() { //debugger;
            var $checked = $('#dg').find('input[type=checkbox]:checked');
            var uid = $checked.attr('data-id');
            var index = this.getIndexbyUid(uid, $this.list);
            var ids = [];

            if ($checked.length == 0) {
                alert('请选择至少一个用户进行删除！');
                return false;
            };

            if (!confirm('确定要删除该用户么？')) {
                return false;
            };

            $.each($checked, function(index, dom) {
                ids.push(dom.getAttribute('data-id')*1);
                ids.join(",");
            });

            $.each($this.list, function(index, val){
                var $that = this;
                for(var i=0; i<ids.length; i++) {
                    if ($that.ID == ids[i]) {
                        $this.list[index] = null;
                    }
                }
            });

            $this.list = $this.list.filter(function(val){ //展示数据
                return val;
            });

            $this.createTableBody(1, $this.PAGE_SIZE, $this.list);
            $this.createTableFoot();
            $("input[name='chkall']").prop('checked', false);
            return false;
        },

        getIndexbyUid: function(uid, list) {
            var index = -1;
            $.each(list, function(i, obj) {
                if (obj.ID == uid) {
                   index = i;
                   return false;
                };
            });
                return index;
        },

        //添加鼠标悬浮事件
        registermousehover: function () {
            //添加鼠标悬浮事件
            $("table[id='" + this._id + "'] tbody tr").mouseover(function () {
                $(this).addClass("mouseover");
            })
            .mouseleave(function () {
                $(this).removeClass("mouseover");
            });
        },

        //添加隔行变色事件
        registerchangebgcolor: function () {
            //添加隔行变色
            if (this.settings.isoddcolor) $("table[id='" + this._id + "'] tr:odd")
                .css("background-color", "#A77C7B")
                .css("color", "#fff");
        },

        //选择每页几条
        numberOfBarsClick: function() {
            var derivationBtn = $("#form1").find(".pagging .export .click");
            derivationBtn.on('click', function() {
                var val = $("#form1").find(".layui-input-inline .rowOf").val();
                var PAGE_SIZE = val;
                $this.PAGE_SIZE = PAGE_SIZE;
                // console.log($this.PAGE_SIZE)
                $this.createTableBody(1, $this.PAGE_SIZE);
                $this.createTableFoot();
                return false;
            });
        },

        //添加全选全不选事件
        registercheckall: function () {
            $("input[name='chkall']").click(function () {
                if (this.checked) {
                    $("input[name='chk']").each(function () {
                        $(this).attr("checked", true);
                    });
                } else {
                    $("input[name='chk']").each(function () {
                        $(this).attr("checked", false);
                    });
                }
            });

            $("table").delegate("input[name='chk']", "click", function() {
                var $checkbox = $('input[name="chk"]');
                var $checked = $('input[name="chk"]:checked');
                var $checkAllBtn = $('input[name="chkall"]');
                if ($checkbox.length == $checked.length) {
                    $checkAllBtn.prop('checked',true);
                } else {
                    $checkAllBtn.prop('checked',false);
                }
            })
        },

        //添加首页事件
        registerFirstPage: function () {
            $("#firstPage").click(function(){
                $this.settings.pageindex = 1;
                $this.createTableBody( $this.settings.pageindex);
            });
        },

        //添加上一页事件
        registerUpPage: function () {
            $("table").delegate("#UpPage", "click",
            function () {
                if ( $this.settings.pageindex == 1) {
                    alert("已经是第一页了");
                    return;
                }
                $this.settings.pageindex = $this.settings.pageindex - 1;
                $this.createTableBody($this.settings.pageindex);
            });
        },

        //添加下一页事件
        registerNextPage: function () {
            $("table").delegate("#nextPage", "click",
            function () {
                if ($this.settings.pageindex == $this.settings.totalpage) {
                    alert("已经是最后一页了");
                    return;
                }
                $this.settings.pageindex = $this.settings.pageindex + 1;
                $this.createTableBody($this.settings.pageindex);
            });
        },

        //添加尾页事件
        registerlastPage: function () {
            $("table").delegate("#lastPage", "click",
            function () {
                $this.settings.pageindex = $this.settings.totalpage;
                $this.createTableBody( $this.settings.totalpage);
            });
        },

        //添加页数跳转事件
        registerSkipPage: function() {
            $("table").delegate("#skippage", "click", function() {
                var _self = this;
                var value = $("table tfoot tr td input").val();

                if (!isNaN(parseInt(value))) {

                    if (parseInt(value) <= $this.settings.totalpage) {
                        $this.createTableBody(parseInt(value, this.PAGE_SIZE));
                    } else {
                        alert("超出页总数");
                    }

                } else {
                    alert("请输入数字");
                }
            });
        },

        //添加排序
        toAddSortingClick() {
            var $table = $("table");
            var $tbody = $("tbody");
            var $thead = $table.find("thead");
            var $th = $table.find("th").eq(4);
            var sArr = [];
            var state = true;
            var $span = $th.find("span")
            var index;

            $th.on("click", function() {
                var $tr = $tbody.find("tr");
                index = $(this).index();

                for (var i = 0; i < $tr.length; i ++) {
                    sArr.push($tr[i]);
                };

                if (state == true) {
                    sArr.sort(function(a, b) {
                        return $(a).find('td:eq('+index+')').text() - $(b).find('td:eq('+index+')').text();
                    });

                    state = false;
                }else {
                    sArr.sort(function(a, b) {
                        return $(a).find('td:eq('+index+')').text() + $(b).find('td:eq('+index+')').text();
                    });
                    state = true
                }

                for (var i = 0; i < sArr.length; i ++) {
                    $tbody.append(sArr[i]);
                };

            })
        },

        //搜索
        beginYourSearch() {
            var btnSearch = $(".btn");
            var json = $this.getAjaxDate($this.settings.url, null);
            var list;
            var newlist;
            $this.list = json.rows;
            list = $this.list;

            btnSearch.on("click", function() {
                var val = $(".form-search").val();

                if (val == "") {
                    alert("请输入搜索的内容")
                }

                newlist = getMatchedArrByKeyWord(val, list);
                $this.createTableBody(1, $this.PAGE_SIZE, newlist);
                $this.createTableFoot();
            });

            function getMatchedArrByKeyWord (KeyWord, list){ //通过关键字得到匹配数组
                var arr = [];
                if (!KeyWord) {
                    return list;
                }

                $.each(list, function(i, obj) { //循环列表
                    if (obj.name.indexOf(KeyWord) > -1) {
                        arr.push(obj);
                    }
                });

                return arr;
            };
        },

        //添加异步ajax事件
        getAjaxDate: function (url, parms) {
            //定义一个全局变量来接受$post的返回值
            var result;

            //用ajax的同步方式‘‘
            $.ajax({
                url: url,
                type: "get",
                async: false,
                //改为同步方式
                data: parms,
                success: function (data) {
                    result = JSON.parse(data);
                }
            });
            // console.log(result);
            return result;

        }
    }

    $.fn.grid = function (options) { //用到的数据
        var $this = $(this); //要操作的元素
        var grid = new dataGrid($this, options); //生成实例
        return $this.each(function () {
            grid.init();
        });
    }
})
