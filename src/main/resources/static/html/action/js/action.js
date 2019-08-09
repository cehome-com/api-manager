var actionTableOptions = {
    container: '#editTable',
    headers: [
        {text: '编号', width: '5%'},
        {text: '接口名称', width: '20%'},
        {text: '所属模块', width: '10%'},
        {text: '级别', width: '5%'},
        {text: '状态', width: '8%'},
        {text: '创建人', width: '7%'},
        {text: '修改人', width: '7%'},
        {text: '操作', width: '30%'}
    ],
    form: '#form',
    fields: [
        {name: 'id', type: 'input', inputDesc: '接口编号', required: false},
        {name: 'actionName', type: 'input', inputDesc: '接口地址', required: true},
        {name: 'moduleId', type:'select', inputDesc: '所属模块', required: true, options:{
                optionField: {value: 'id', text: 'moduleName'},
                async: false,
                url: api.util.getUrl('apimanager/module/list')
            }
        },
        {name: 'actionLevel', type:'select', inputDesc: '接口级别', required: true, options:{
                optionField: {value: 'k', text: 'v'},
                params:{metaId: 7},
                cache: true,
                async: false,
                url: api.util.getUrl('apimanager/meta/findMeta')
            }
        },
        {name: 'status', type:'select', inputDesc: '状态', required: true, options:{
                optionField: {value: 'k', text: 'v'},
                params:{metaId: 3},
                cache: true,
                async: false,
                url: api.util.getUrl('apimanager/meta/findMeta')
            }
        },
        {name: 'createUserName', type: 'input', inputDesc: '创建人', required: false, readOnly: true},
        {name: 'updateUserName', type: 'input', inputDesc: '修改人', required: false, readOnly: true}
    ],
    rowButtons: [
        {type: 'more', text: '查看', icon: 'glyphicon glyphicon-eye-open', fn: function (param) {
                $('#depart').empty();
                var actionInfoFormObject, headParam, requestParam, responseParam, responseFailParam;
                var parentId = $('select[name=moduleId]').val();
                var depId = $('select[name=depId]').val();
                var projectId = $('select[name=projectId]').val();
                var createUserSelect = $('select[name=createUser]').val();
                var actionResult = {};
                $.ajax({
                    type: 'get',
                    url: api.util.getUrl('/apimanager/action/findById'),
                    data: {id: param.id},
                    dataType: "json",
                    async: false,
                    contentType: 'json',
                    success: function (result) {
                        actionResult = result;
                    }
                });
                var conf = {
                    container: '#container',
                    url: api.util.getUrl('html/action/actionTab.html'),
                    async: false,
                    loaded: function () {
                        var progress = api.ui.progress({});
                        var $cancelSave = $('#cancelSave'),$editChange = $('#editChange');
                        var $cancelButton = $('#cancelButton'),$editCancel = $('#editCancel'),$editButton = $('#editButton'),$saveButton = $('#saveButton');
                        $cancelSave.css('display','none');
                        var actionTabConf = {
                            container: '#tabs',
                            tabs: [{
                                title: '基本信息',
                                width: '10%',
                                href: api.util.getUrl('html/action/actionInfo.html'),
                                loaded: function () {
                                    var data = actionResult['data'];
                                    api.util.loadScript(api.util.getUrl('html/action/js/actionInfo.js'), function () {
                                        api.ui.chosenSelect(typeSelectOption);
                                        api.ui.chosenSelect(statusSelectOption);
                                        api.ui.chosenSelect(actionLevelSelectOption);
                                        api.ui.chosenSelect(moduleOptions);
                                        api.ui.chosenSelect(domainSelectOptions);
                                        // api.ui.chosenSelect(testGroupSelectOption);
                                        actionInfoFormObject = api.ui.form(actionInfoFormOptions);
                                        actionInfoFormObject.giveVal({
                                            id: data['id'],
                                            requestUrl: data['requestUrl'],
                                            actionName: data['actionName'],
                                            moduleId: data['moduleId'],
                                            requestType: data['requestType'],
                                            status: data['status'],
                                            actionLevel: data['actionLevel'],
                                            actionDesc: data['actionDesc'],
                                            domainId: data['domainId']
                                        });
                                        actionInfoFormObject.disable();
                                    });
                                }
                            }, {
                                title: '接口参数',
                                width: '10%',
                                lazy: false,
                                href: api.util.getUrl('html/action/actionParam.html'),
                                loaded: function () {
                                    var data = actionResult['data'];
                                    api.util.loadScript(api.util.getUrl('html/action/js/actionParam.js'), function () {
                                        headParam = api.ui.param(headOptions);
                                        requestParam = api.ui.param(requestOptions);
                                        responseParam = api.ui.param(responseOptions);
                                        responseFailParam = api.ui.param(responseFailOptions);
                                        if (data && data['requestHeadDefinition']) {
                                            var rowData = JSON.parse(data['requestHeadDefinition']);
                                            $.each(rowData, function (index, data) {
                                                headParam._showRow(data);
                                            })
                                        }
                                        if (data && data['requestDefinition']) {
                                            var rowData = JSON.parse(data['requestDefinition']);
                                            $.each(rowData, function (index, data) {
                                                requestParam._showRow(data);
                                            })
                                        }
                                        if (data && data['responseDefinition']) {
                                            var rowData = JSON.parse(data['responseDefinition']);
                                            $.each(rowData, function (index, data) {
                                                responseParam._showRow(data);
                                            })
                                        }
                                        if (data && data['responseFailDefinition']) {
                                            var rowData = JSON.parse(data['responseFailDefinition']);
                                            $.each(rowData, function (index, data) {
                                                responseFailParam._showRow(data);
                                            })
                                        }
                                        var $requestImportBtn = $('#requestParam').find('.importBtn');
                                        $requestImportBtn.on('click',function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<textarea class="col-12 form-control" name="responseJson" style="height: 300px;"></textarea>',
                                                iTitle: false,
                                                title: '请求参数',
                                                formCheck: true,
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function (result) {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            //校验导入参数是否是json类型
                                                            try {
                                                                if (typeof JSON.parse(importJson) == "object") {
                                                                    if(importJson && $.trim(importJson) != ''){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                            type: 'post',
                                                                            data : importJson,
                                                                            contentType : 'application/json;charset=utf-8',
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var code = result.code;
                                                                                if(code == '0'){
                                                                                    var data = result.data;
                                                                                    $.each(JSON.parse(data), function (index, rowData) {
                                                                                        requestParam._showRow(rowData);
                                                                                    })
                                                                                } else {
                                                                                    var serverErrorOptions = {
                                                                                        content: "导入失败！",
                                                                                        formCheck: true
                                                                                    }
                                                                                    api.ui.dialog(serverErrorOptions).open();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            } catch (e){
                                                                var jsonErrorOptions = {
                                                                    content: "不正确的json数据格式",
                                                                    formCheck: true
                                                                }
                                                                api.ui.dialog(jsonErrorOptions).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {

                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        })
                                        var $requestImportDescBtn = $('#requestParam').find('.importDescBtn');
                                        $requestImportDescBtn.on('click',function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectDescNames" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象参数',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var objectDescNames = $('input[name=objectDescNames]').val();
                                                            if(objectDescNames && $.trim(objectDescNames) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/object/field/findObjectInfoByClassWholeNames'),
                                                                    type: 'GET',
                                                                    data : {'classWholeNames': objectDescNames},
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        $.each(data, function (index, rowData) {
                                                                            requestParam._showRow(rowData);
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    var options = {
                                                        container: modalBody.find('input[name=objectDescNames]'),
                                                        url: api.util.getUrl('apimanager/object/field/listObjectNames'),
                                                        multiItem: false,
                                                        appendTo: modalBody
                                                    }
                                                    api.ui.autocomplete(options);
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        })

                                        var $requestCreateObjBtn = $('#requestParam').find('.createObjBtn');
                                        $requestCreateObjBtn.on('click', function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectClassName" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象名称',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '确定', fn: function () {
                                                            var objectClassName = $('input[name=objectClassName]').val();
                                                            if(objectClassName && $.trim(objectClassName) != ''){
                                                                var data = requestParam.toData();
                                                                $.ajax({
                                                                    url: api.util.getUrl('/apimanager/object/field/createObj'),
                                                                    type: 'post',
                                                                    data : JSON.stringify({'fieldInfoValue': JSON.stringify(data), 'classWholeName': objectClassName}),
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    success: function (result) {
                                                                        var code = result.code;
                                                                        if(code == '-1'){
                                                                            var options = {
                                                                                content: '对象创建失败！'
                                                                            };
                                                                            api.ui.dialog(options).open();
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                var options = {
                                                                    content: '对象名称不能为空！'
                                                                };
                                                                api.ui.dialog(options).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        });

                                        var $responseCreateObjBtn = $('#responseParam').find('.createObjBtn');
                                        $responseCreateObjBtn.on('click', function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectClassName" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象名称',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '确定', fn: function () {
                                                            var objectClassName = $('input[name=objectClassName]').val();
                                                            if(objectClassName && $.trim(objectClassName) != ''){
                                                                var data = responseParam.toData();
                                                                $.ajax({
                                                                    url: api.util.getUrl('/apimanager/object/field/createObj'),
                                                                    type: 'post',
                                                                    data : JSON.stringify({'fieldInfoValue': JSON.stringify(data), 'classWholeName': objectClassName}),
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    success: function (result) {
                                                                        var code = result.code;
                                                                        if(code == '-1'){
                                                                            var options = {
                                                                                content: '对象创建失败！'
                                                                            };
                                                                            api.ui.dialog(options).open();
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                var options = {
                                                                    content: '对象名称不能为空！'
                                                                };
                                                                api.ui.dialog(options).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        });

                                        var $responseImportDescBtn = $('#responseParam').find('.importDescBtn');
                                        $responseImportDescBtn.on('click',function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectDescNames" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象备注',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var objectDescNames = $('input[name=objectDescNames]').val();
                                                            if(objectDescNames && $.trim(objectDescNames) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/object/field/findObjectDescByClassWholeNames'),
                                                                    type: 'GET',
                                                                    data : {'classWholeNames': objectDescNames},
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        responseParam.giveDesc(data);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    var options = {
                                                        container: modalBody.find('input[name=objectDescNames]'),
                                                        url: api.util.getUrl('apimanager/object/field/listObjectNames'),
                                                        appendTo: modalBody
                                                    }
                                                    api.ui.autocomplete(options);
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        })
                                        var $responseImportBtn = $('#responseParam').find('.importBtn');
                                        $responseImportBtn.on('click',function () {
                                            var $templateBtnDiv = $('<div></div>');
                                            var $addTempBtn = $('<button type="button" class="btn btn-success btn-sm addTempBtn">生成模板</button>');
                                            $templateBtnDiv.append($addTempBtn);
                                            $.ajax({
                                                url: api.util.getUrl('apimanager/template/list'),
                                                type: 'get',
                                                data : {'templateType': 2},
                                                dataType: 'json',
                                                async: false,
                                                success: function (result) {
                                                    var datas = result.data;
                                                    $.each(datas, function (index, data) {
                                                        var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                        $templateBtn.text(data['templateName']);
                                                        $templateBtn.attr('primaryId', data['id']);
                                                        $templateBtn.attr('templateContent', data['templateContent']);
                                                        $templateBtnDiv.append($templateBtn);
                                                    })
                                                }
                                            });
                                            var dialogOptions = {
                                                container: 'body',
                                                content: $templateBtnDiv.html() + '<textarea class="col-12 form-control" name="responseJson" style="height: 300px; margin-top: 2px;"></textarea>',
                                                iTitle: false,
                                                title: '响应参数',
                                                formCheck: true,
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            //校验导入参数是否是json类型
                                                            try {
                                                                if (typeof JSON.parse(importJson) == "object") {
                                                                    if(importJson && $.trim(importJson) != ''){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                            type: 'post',
                                                                            data : importJson,
                                                                            contentType : 'application/json;charset=utf-8',
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var code = result.code;
                                                                                if(code == '0'){
                                                                                    var data = result.data;
                                                                                    $.each(JSON.parse(data), function (index, rowData) {
                                                                                        responseParam._showRow(rowData);
                                                                                    })
                                                                                } else {
                                                                                    var serverErrorOptions = {
                                                                                        content: "导入失败！",
                                                                                        formCheck: true
                                                                                    }
                                                                                    api.ui.dialog(serverErrorOptions).open();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            } catch (e){
                                                                var jsonErrorOptions = {
                                                                    content: "不正确的json数据格式",
                                                                    formCheck: true
                                                                }
                                                                api.ui.dialog(jsonErrorOptions).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    modalBody.find('.addTempBtn').on('click', function () {
                                                        var that = $(this);
                                                        var content = modalBody.find('textarea[name=responseJson]').val();
                                                        if(!content || $.trim(content).length == 0){
                                                            var options = {
                                                                content: '模板内容不能为空！'
                                                            };
                                                            api.ui.dialog(options).open();
                                                            return;
                                                        }
                                                        var options = {
                                                            content: '<input type="text" class="form-control" name="templateName" placeholder="模板名称，如：ret-result">',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function (innerModalBody) {
                                                                        var templateName = innerModalBody.find('input[name=templateName]').val();
                                                                        if(templateName && $.trim(templateName).length > 0){
                                                                            $.ajax({
                                                                                url: api.util.getUrl('apimanager/template/add'),
                                                                                type: 'GET',
                                                                                data: {'templateName': templateName,'templateContent': content, 'templateType': 2},
                                                                                dataType: 'json',
                                                                                success: function (result) {
                                                                                    var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                                                    $templateBtn.text(templateName);
                                                                                    $templateBtn.attr('primaryId', result['data']);
                                                                                    $templateBtn.attr('templateContent', content);
                                                                                    modalBody.find('textarea[name=responseJson]').before($templateBtn);
                                                                                    modalBody.find('textarea[name=responseJson]').val('');
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    });
                                                    var clickTimeId;
                                                    var templateBtnClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        clickTimeId = setTimeout(function () {
                                                            var content = modalBody.find('textarea[name=responseJson]').val(), that = $(event.target);
                                                            if(content && $.trim(content).length > 0){
                                                                var contentObj = JSON.parse(content);
                                                                var templateContent = JSON.parse(that.attr('templateContent'));
                                                                Object.keys(templateContent).forEach(function(key) {
                                                                    if(typeof templateContent[key] === 'object'){
                                                                        templateContent[key] = contentObj;
                                                                    };
                                                                });
                                                                var templateBString = JSON.stringify(templateContent, null, 4);
                                                                modalBody.find('textarea[name=responseJson]').val(templateBString);
                                                            } else {
                                                                var templateContent = JSON.parse(that.attr('templateContent'));
                                                                var templateBString = JSON.stringify(templateContent, null, 4);
                                                                modalBody.find('textarea[name=responseJson]').val(templateBString);
                                                            }
                                                        }, 250);
                                                    }
                                                    var templateBtnDbClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        var that = $(event.target);
                                                        var options = {
                                                            content: '确认删除模板？',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function () {
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/template/delete'),
                                                                            type: 'GET',
                                                                            data: {'id': that.attr('primaryId')},
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                that.remove();
                                                                            }
                                                                        });
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    }
                                                    modalBody.on('click', '.templateBtn', templateBtnClick);
                                                    modalBody.on('dblclick', '.templateBtn', templateBtnDbClick);
                                                }
                                            };
                                            var importDialog = api.ui.dialog(dialogOptions).open();
                                        })
                                        var $responseFailImportBtn = $('#responseFailParam').find('.importBtn');
                                        $responseFailImportBtn.on('click',function () {
                                            var $templateBtnDiv = $('<div></div>');
                                            var $addTempBtn = $('<button type="button" class="btn btn-success btn-sm addTempBtn">生成模板</button>');
                                            $templateBtnDiv.append($addTempBtn);
                                            $.ajax({
                                                url: api.util.getUrl('apimanager/template/list'),
                                                type: 'get',
                                                data : {'templateType': 3},
                                                dataType: 'json',
                                                async: false,
                                                success: function (result) {
                                                    var datas = result.data;
                                                    $.each(datas, function (index, data) {
                                                        var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                        $templateBtn.text(data['templateName']);
                                                        $templateBtn.attr('primaryId', data['id']);
                                                        $templateBtn.attr('templateContent', data['templateContent']);
                                                        $templateBtnDiv.append($templateBtn);
                                                    })
                                                }
                                            });
                                            var dialogOptions = {
                                                container: 'body',
                                                content: $templateBtnDiv.html() + '<textarea class="col-12 form-control" name="responseJson" style="height: 300px; margin-top: 2px;"></textarea>',
                                                iTitle: false,
                                                title: '响应参数',
                                                formCheck: true,
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            //校验导入参数是否是json类型
                                                            try {
                                                                if (typeof JSON.parse(importJson) == "object") {
                                                                    if(importJson && $.trim(importJson) != ''){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                            type: 'post',
                                                                            data : importJson,
                                                                            contentType : 'application/json;charset=utf-8',
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var code = result.code;
                                                                                if(code == '0'){
                                                                                    var data = result.data;
                                                                                    $.each(JSON.parse(data), function (index, rowData) {
                                                                                        responseFailParam._showRow(rowData);
                                                                                    })
                                                                                } else {
                                                                                    var serverErrorOptions = {
                                                                                        content: "导入失败！",
                                                                                        formCheck: true
                                                                                    }
                                                                                    api.ui.dialog(serverErrorOptions).open();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            } catch (e){
                                                                var jsonErrorOptions = {
                                                                    content: "不正确的json数据格式",
                                                                    formCheck: true
                                                                }
                                                                api.ui.dialog(jsonErrorOptions).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    modalBody.find('.addTempBtn').on('click', function () {
                                                        var that = $(this);
                                                        var content = modalBody.find('textarea[name=responseJson]').val();
                                                        if(!content || $.trim(content).length == 0){
                                                            var options = {
                                                                content: '模板内容不能为空！'
                                                            };
                                                            api.ui.dialog(options).open();
                                                            return;
                                                        }
                                                        var options = {
                                                            content: '<input type="text" class="form-control" name="templateName" placeholder="模板名称，如：ret-result">',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function (innerModalBody) {
                                                                        var templateName = innerModalBody.find('input[name=templateName]').val();
                                                                        if(templateName && $.trim(templateName).length > 0){
                                                                            $.ajax({
                                                                                url: api.util.getUrl('apimanager/template/add'),
                                                                                type: 'GET',
                                                                                data: {'templateName': templateName,'templateContent': content, 'templateType': 3},
                                                                                dataType: 'json',
                                                                                success: function (result) {
                                                                                    var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                                                    $templateBtn.text(templateName);
                                                                                    $templateBtn.attr('primaryId', result['data']);
                                                                                    $templateBtn.attr('templateContent', content);
                                                                                    modalBody.find('textarea[name=responseJson]').before($templateBtn);
                                                                                    modalBody.find('textarea[name=responseJson]').val('');
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    });
                                                    var clickTimeId;
                                                    var templateBtnClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        clickTimeId = setTimeout(function () {
                                                            var $textAreaObj = modalBody.find('textarea[name=responseJson]'), that = $(event.target);
                                                            $textAreaObj.val('');
                                                            var templateContent = JSON.parse(that.attr('templateContent'));
                                                            var templateBString = JSON.stringify(templateContent, null, 4);
                                                            $textAreaObj.val(templateBString);
                                                        }, 250);
                                                    };
                                                    var templateBtnDbClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        var that = $(event.target);
                                                        var options = {
                                                            content: '确认删除模板？',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function () {
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/template/delete'),
                                                                            type: 'GET',
                                                                            data: {'id': that.attr('primaryId')},
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                that.remove();
                                                                            }
                                                                        });
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    }
                                                    modalBody.on('click', '.templateBtn', templateBtnClick);
                                                    modalBody.on('dblclick', '.templateBtn', templateBtnDbClick);
                                                }
                                            };
                                            var importDialog = api.ui.dialog(dialogOptions).open();
                                        })
                                        headParam.disable();
                                        requestParam.disable();
                                        responseParam.disable();
                                        responseFailParam.disable();
                                        progress._hide();
                                    });
                                }
                            }
                            , {
                                title: '接口测试',
                                width: '10%',
                                lazy: true,
                                href: api.util.getUrl('html/action/actionInnerTest.html'),
                                loaded: function () {
                                    var testHeadParam, testRequestParam;
                                    var data = actionResult['data'];
                                    api.util.loadScript(api.util.getUrl('html/action/js/actionTest.js'), function () {
                                        var requestTypeSelect = api.ui.chosenSelect(requestTypeOptions);
                                        testHeadParam = api.ui.param(testHeadOptions);
                                        testRequestParam = api.ui.param(testRequestOptions);
                                        if (data) {
                                            requestTypeSelect.val(data['requestType']);
                                            $('[name=testRequestUrl]').val(data['requestUrl']);
                                            $.ajax({
                                                url: api.util.getUrl('apimanager/domain/findById'),
                                                type: 'GET',
                                                data: {id: data['domainId']},
                                                dataType: 'json',
                                                success: function (result) {
                                                    var resultData = result.data;
                                                    var domainEditSelect = api.ui.editSelect(domainEditOptions);
                                                    domainEditSelect._load({domainName: resultData.domainName.split('.')[0]});
                                                    domainEditSelect._val(resultData.id);
                                                }
                                            })
                                            if (data['requestHeadDefinition']) {
                                                var rowData = JSON.parse(data['requestHeadDefinition']);
                                                $.each(rowData, function (index, data) {
                                                    testHeadParam._showRow(data);
                                                })
                                            }
                                            if (data['requestDefinition']) {
                                                var rowData = JSON.parse(data['requestDefinition']);
                                                $.each(rowData, function (index, data) {
                                                    testRequestParam._showRow(data);
                                                })
                                            }
                                        }
                                    });
                                    $('#sendRequest').on('click', function () {
                                        var domainName = $('[name=testDomainId]').val(), requestType = $('[name=testRequestType]').val(), requestUrl = $('[name=testRequestUrl]').val();
                                        if(!domainName || $.trim(domainName) == ''){
                                            var options = {
                                                content: '服务地址不能为空！'
                                            };
                                            api.ui.dialog(options).open();
                                            return;
                                        }
                                        if(!requestUrl || $.trim(requestUrl) == ''){
                                            var options = {
                                                content: '接口地址不能为空！'
                                            };
                                            api.ui.dialog(options).open();
                                            return;
                                        }
                                        var progress = api.ui.progress({});
                                        var requestMockTemplate = api.util.buildMockTemplate(testRequestParam.toData());
                                        var headMockTemplate = api.util.buildMockTemplate(testHeadParam.toData());
                                        var requestData = Mock.mock(requestMockTemplate), headData = Mock.mock(headMockTemplate);
                                        var requestDataStr = JSON.stringify(requestData), headDataStr = JSON.stringify(headData);
                                        $('#requestJson').JSONView(requestDataStr);
                                        $('#requestJsonArea').val(requestDataStr);

                                        var requestBody = {};
                                        requestBody['domainName'] = domainName;
                                        requestBody['requestType'] = requestType;
                                        requestBody['requestUrl'] = requestUrl;
                                        requestBody['requestHeadData'] = headDataStr;
                                        requestBody['requestData'] = requestDataStr;
                                        $.ajax({
                                            url: api.util.getUrl('apimanager/tester/send'),
                                            type: 'POST',
                                            contentType: 'application/json;charset=UTF-8', //解决415问题
                                            data: JSON.stringify(requestBody),//解决400问题
                                            dataType: 'json',
                                            success: function (result) {
                                                progress._hide();
                                                var code = result.code;
                                                if(code == '-1'){
                                                    $('#responseJsonArea').val(JSON.stringify(result));
                                                    $('#responseJson').JSONView(result);
                                                } else {
                                                    var data = result.data, dataStr = JSON.stringify(data)
                                                    $('#responseJsonArea').val(dataStr);
                                                    $('#responseJson').JSONView(dataStr);
                                                }
                                                $('#requestJsonFormatLink')[0].scrollIntoView();
                                            }
                                        });
                                    });
                                    $('#requestJsonFormatLink').on('click', function () {
                                        $('#requestJson').css('display', '');
                                        $('#requestJsonArea').css('display', 'none');
                                    });
                                    $('#requestJsonRowLink').on('click', function () {
                                        $('#requestJson').css('display', 'none');
                                        $('#requestJsonArea').css('display', '');
                                    });
                                    $('#responseJsonFormatLink').on('click', function () {
                                        $('#responseJson').css('display', '');
                                        $('#responseJsonArea').css('display', 'none');
                                    });
                                    $('#responseJsonRowLink').on('click', function () {
                                        $('#responseJson').css('display', 'none');
                                        $('#responseJsonArea').css('display', '');
                                    });
                                }
                            }
                            ]
                        }
                        var actionTabConfObject = api.ui.tabs(actionTabConf);

                        $('#exportBtn').on('click',function () {
                            window.open(api.util.getUrl('/apimanager/action/downloadPdf'+'?actionId='+param.id))
                        })
                        //切换
                        $editButton.on('click', function () {
                            actionInfoFormObject.enable();
                            headParam.enable();
                            requestParam.enable();
                            responseParam.enable();
                            responseFailParam.enable();
                            $editChange.css('display','none');
                            $cancelSave.css('display','');
                            var activeTabTitle = actionTabConfObject.activeTabTitle();
                            if(activeTabTitle == '接口测试'){
                                actionTabConfObject.show('基本信息');
                            }
                            actionTabConfObject.hide('接口测试');
                        });
                        //取消保存
                        $cancelButton.mousedown(function () {
                            var progress = api.ui.progress({});
                            actionInfoFormObject.reset();
                            actionInfoFormObject.disable();
                            actionTabConfObject.display('接口测试');
                            var data = actionResult['data'];
                            api.util.loadScript(api.util.getUrl('html/action/js/actionParam.js'), function () {
                                headParam._empty();
                                requestParam._empty();
                                responseParam._empty();
                                responseFailParam._empty();
                                if (data && data['requestHeadDefinition']) {
                                    var rowData = JSON.parse(data['requestHeadDefinition']);
                                    $.each(rowData, function (index, data) {
                                        headParam._showRow(data);
                                    })
                                }
                                if (data && data['requestDefinition']) {
                                    var rowData = JSON.parse(data['requestDefinition']);
                                    $.each(rowData, function (index, data) {
                                        requestParam._showRow(data);
                                    })
                                }
                                if (data && data['responseDefinition']) {
                                    var rowData = JSON.parse(data['responseDefinition']);
                                    $.each(rowData, function (index, data) {
                                        responseParam._showRow(data);
                                    })
                                }
                                if (data && data['responseFailDefinition']) {
                                    var rowData = JSON.parse(data['responseFailDefinition']);
                                    $.each(rowData, function (index, data) {
                                        responseFailParam._showRow(data);
                                    })
                                }
                                headParam.disable();
                                requestParam.disable();
                                responseParam.disable();
                                responseFailParam.disable();
                                progress._hide();
                            });
                            $editChange.css('display', '');
                            $cancelSave.css('display', 'none');
                        });
                        //退出查看页面
                        $editCancel.mousedown(function () {
                            //跳转到action列表
                            var conf = {
                                container: '#container',
                                url: api.util.getUrl('html/action/action.html'),
                                async: false,
                                preLoad: function () {
                                    $("#depart").empty();
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"departmentClick()\">Department</a></li>");
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"projectClick1()\">Project</a></li>");
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"actionClick1()\">Action</a></li>");
                                },
                                loaded: function () {
                                    var depOptions = {
                                        selector: '[name=depId]',
                                        optionField: {value: 'id', text: 'depName'},
                                        width: '70%',
                                        async: false,
                                        url: api.util.getUrl('apimanager/department/list'),
                                        change: function (e, p) {
                                            var params = {};
                                            params['depId'] = e.target.value;
                                            var projectOptions = {
                                                selector: '[name=projectId]',
                                                optionField: {value: 'id', text: 'projectName'},
                                                width: '70%',
                                                async: false,
                                                params: params,
                                                url: api.util.getUrl('apimanager/project/list'),
                                                change: function (e, p) {
                                                    var params = {};
                                                    params['projectId'] = e.target.value;
                                                    var moduleOptions = {
                                                        selector: '[name=moduleId]',
                                                        optionField: {value: 'id', text: 'moduleName'},
                                                        width: '70%',
                                                        params: params,
                                                        async: false,
                                                        url: api.util.getUrl('apimanager/module/list')
                                                    };
                                                    var moduleSelect = api.ui.chosenSelect(moduleOptions);
                                                    moduleSelect.val(parentId);
                                                }
                                            };
                                            var projectSelect = api.ui.chosenSelect(projectOptions);
                                            projectSelect.val(projectId);
                                            projectSelect.doChange();
                                        }
                                    };

                                    var depSelect = api.ui.chosenSelect(depOptions);
                                    depSelect.val(depId);
                                    depSelect.doChange();
                                    var createUserOptions = {
                                        selector: '[name=createUser]',
                                        optionField: {value: 'id', text: 'userName'},
                                        width: '50%',
                                        selectedVal: createUserSelect,
                                        async: false,
                                        blank: true,
                                        url: api.util.getUrl('apimanager/user/list')
                                    }
                                    var createSelect = api.ui.chosenSelect(createUserOptions);
                                    api.util.loadScript(api.util.getUrl("html/action/js/action.js") ,function () {
                                        api.ui.editTable(actionTableOptions);
                                    });
                                }
                            }
                            api.ui.load(conf);
                        });
                        //保存
                        $saveButton.on('click', function () {
                            //表单非空校验
                            var i = 0;
                            $('#actionInfoForm').find('input,select').each(function(){
                                var $this = $(this), value = $.trim($this.val());
                                if($this.attr('required') && !value){
                                    i = 1;
                                    $(this).css('border-color','red');
                                    $(this).on('blur',function () {
                                        if($.trim($(this).val())){
                                            $(this).css('border-color','');
                                        }
                                    })
                                    return true;
                                }
                            });
                            if(i == 1){
                                actionTabConfObject.show('基本信息');
                                var option = {content: '请完善接口基本信息'};
                                api.ui.dialog(option).open();
                                return;
                            }
                            if (headParam._checkEmpty() || requestParam._checkEmpty()
                                || responseParam._checkEmpty() || responseFailParam._checkEmpty()
                                || headParam.defaultFlag == 1 || requestParam.defaultFlag == 1
                                || responseParam.defaultFlag == 1 || responseFailParam.defaultFlag == 1) {
                                var option = {content: '请完善接口参数信息'};
                                api.ui.dialog(option).open();
                                return;
                            }
                            var headArr = headParam.toData();
                            var requestArr = requestParam.toData();
                            var responseArr = responseParam.toData();
                            var responseFailAttr = responseFailParam.toData();
                            var requestData = actionInfoFormObject.toJson();
                            requestData['id'] = param.id;
                            requestData['requestHeadDefinition'] = JSON.stringify(headArr);
                            requestData['requestDefinition'] = JSON.stringify(requestArr);
                            requestData['responseDefinition'] = JSON.stringify(responseArr);
                            requestData['responseFailDefinition'] = JSON.stringify(responseFailAttr);
                            $.ajax({
                                url: api.util.getUrl('apimanager/action/update'),
                                type: 'post',
                                contentType: 'application/json;charset=UTF-8',
                                data: JSON.stringify(requestData),
                                dataType: 'json',
                                success: function (data) {
                                    if(data.code == -1){
                                        var option={
                                            content: '<span id="sigleErrorMsg" class="glyphicon glyphicon-remove" style="cursor: pointer;">&nbsp;保存失败，点击查看详细</span><p></p><textarea readonly class="form-control" id="stackTrace" style="display: none; width: 100%; height: 400px;font-size: small;color: red;"></textarea>',
                                            width: '150%',
                                            opened: function (modalBody) {
                                                modalBody.find('#sigleErrorMsg').on('click', function () {
                                                    var $stackTrace = modalBody.find('#stackTrace');
                                                    if($stackTrace.css('display') == 'none') {
                                                        $stackTrace.css('display', 'block');
                                                    } else {
                                                        $stackTrace.css('display', 'none');
                                                    }
                                                    modalBody.find('#stackTrace').val(data.stackTrace);
                                                });
                                            }
                                        };
                                        api.ui.dialog(option).open();
                                        return;
                                    }

                                    //跳转到action列表
                                    var conf = {
                                        container: '#container',
                                        url: api.util.getUrl('html/action/action.html'),
                                        async: false,
                                        preLoad: function () {
                                            $("#depart").empty();
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"departmentClick()\">Department</a></li>");
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"projectClick1()\">Project</a></li>");
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"actionClick1()\">Action</a></li>");
                                        },
                                        loaded: function () {
                                            var depOptions = {
                                                selector: '[name=depId]',
                                                optionField: {value: 'id', text: 'depName'},
                                                width: '70%',
                                                async: false,
                                                url: api.util.getUrl('apimanager/department/list'),
                                                change: function (e, p) {
                                                    var params = {};
                                                    params['depId'] = e.target.value;
                                                    var projectOptions = {
                                                        selector: '[name=projectId]',
                                                        optionField: {value: 'id', text: 'projectName'},
                                                        width: '70%',
                                                        async: false,
                                                        params: params,
                                                        url: api.util.getUrl('apimanager/project/list'),
                                                        change: function (e, p) {
                                                            var params = {};
                                                            params['projectId'] = e.target.value;
                                                            var moduleOptions = {
                                                                selector: '[name=moduleId]',
                                                                optionField: {value: 'id', text: 'moduleName'},
                                                                width: '70%',
                                                                async: false,
                                                                params: params,
                                                                url: api.util.getUrl('apimanager/module/list')
                                                            };
                                                            var moduleSelect = api.ui.chosenSelect(moduleOptions);
                                                            moduleSelect.val(parentId);
                                                        }
                                                    };
                                                    var projectSelect = api.ui.chosenSelect(projectOptions);
                                                    projectSelect.val(projectId);
                                                    projectSelect.doChange();
                                                }
                                            };

                                            var depSelect = api.ui.chosenSelect(depOptions);
                                            depSelect.val(depId);
                                            depSelect.doChange();
                                            var createUserOptions = {
                                                selector: '[name=createUser]',
                                                optionField: {value: 'id', text: 'userName'},
                                                width: '50%',
                                                selectedVal: createUserSelect,
                                                async: false,
                                                blank: true,
                                                url: api.util.getUrl('apimanager/user/list')
                                            }
                                            var createSelect = api.ui.chosenSelect(createUserOptions);
                                            api.util.loadScript(api.util.getUrl("html/action/js/action.js") ,function () {
                                                api.ui.editTable(actionTableOptions);
                                            });
                                        }
                                    }
                                    api.ui.load(conf);
                                }
                            });
                        });
                    }
                };
                api.ui.load(conf);
            }
        },
        {type: 'copy', text: '复制', icon: 'glyphicon glyphicon-share', fn: function (param) {
                $('#depart').empty();
                var parentId = $('select[name=moduleId]').val();
                var depId = $('select[name=depId]').val();
                var projectId = $('select[name=projectId]').val();
                var createUserSelect = $('select[name=createUser]').val();
                var actionInfoFormObject, headParam, requestParam, responseParam, responseFailParam;
                var actionResult = {};
                $.ajax({
                    type: 'get',
                    url: api.util.getUrl('/apimanager/action/findById'),
                    data: {id: param.id},
                    dataType: "json",
                    async: false,
                    contentType: 'json',
                    success: function (result) {
                        actionResult = result;
                    }
                });
                var conf = {
                    container: '#container',
                    url: api.util.getUrl('html/action/actionTab.html'),
                    async: false,
                    preLoad: function () {},
                    loaded: function () {
                        var progress = api.ui.progress({});
                        var $editChange = $('#editChange');
                        var $cancelButton = $('#cancelButton'),$saveButton = $('#saveButton');
                        $editChange.css('display','none');
                        var actionTabConf = {
                            container: '#tabs',
                            tabs: [{
                                title: '基本信息',
                                width: '10%',
                                href: api.util.getUrl('html/action/actionInfo.html'),
                                loaded: function () {
                                    var data = actionResult['data'];
                                    api.util.loadScript(api.util.getUrl('html/action/js/actionInfo.js'), function () {
                                        api.ui.chosenSelect(typeSelectOption);
                                        api.ui.chosenSelect(statusSelectOption);
                                        api.ui.chosenSelect(actionLevelSelectOption);
                                        api.ui.chosenSelect(moduleOptions);
                                        api.ui.chosenSelect(domainSelectOptions);
                                        // api.ui.chosenSelect(testGroupSelectOption);
                                        actionInfoFormObject = api.ui.form(actionInfoFormOptions);
                                        actionInfoFormObject.giveVal({
                                            actionName: data['actionName'],
                                            moduleId: data['moduleId'],
                                            requestType: data['requestType'],
                                            status: data['status'],
                                            actionLevel: data['actionLevel'],
                                            actionDesc: data['actionDesc'],
                                            domainId: data['domainId']
                                        });
                                    });
                                }
                            }, {
                                title: '接口参数',
                                width: '10%',
                                lazy: false,
                                href: api.util.getUrl('html/action/actionParam.html'),
                                loaded: function () {
                                    var data = actionResult['data'];
                                    api.util.loadScript(api.util.getUrl('html/action/js/actionParam.js'), function () {
                                        headParam = api.ui.param(headOptions);
                                        requestParam = api.ui.param(requestOptions);
                                        responseParam = api.ui.param(responseOptions);
                                        responseFailParam = api.ui.param(responseFailOptions);
                                        if (data && data['requestHeadDefinition']) {
                                            var rowData = JSON.parse(data['requestHeadDefinition']);
                                            $.each(rowData, function (index, data) {
                                                headParam._showRow(data);
                                            })
                                        }
                                        if (data && data['requestDefinition']) {
                                            var rowData = JSON.parse(data['requestDefinition']);
                                            $.each(rowData, function (index, data) {
                                                requestParam._showRow(data);
                                            })
                                        }
                                        if (data && data['responseDefinition']) {
                                            var rowData = JSON.parse(data['responseDefinition']);
                                            $.each(rowData, function (index, data) {
                                                responseParam._showRow(data);
                                            })
                                        }
                                        if (data && data['responseFailDefinition']) {
                                            var rowData = JSON.parse(data['responseFailDefinition']);
                                            $.each(rowData, function (index, data) {
                                                responseFailParam._showRow(data);
                                            })
                                        }
                                        var $requestImportBtn = $('#requestParam').find('.importBtn');
                                        $requestImportBtn.on('click',function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<textarea class="col-12 form-control" name="responseJson" style="height: 300px;"></textarea>',
                                                iTitle: false,
                                                title: '请求参数',
                                                formCheck: true,
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            //校验导入参数是否是json类型
                                                            try {
                                                                if (typeof JSON.parse(importJson) == "object") {
                                                                    if(importJson && $.trim(importJson) != ''){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                            type: 'post',
                                                                            data : importJson,
                                                                            contentType : 'application/json;charset=utf-8',
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var code = result.code;
                                                                                if(code == '0'){
                                                                                    var data = result.data;
                                                                                    $.each(JSON.parse(data), function (index, rowData) {
                                                                                        requestParam._showRow(rowData);
                                                                                    })
                                                                                } else {
                                                                                    var serverErrorOptions = {
                                                                                        content: "导入失败！",
                                                                                        formCheck: true
                                                                                    }
                                                                                    api.ui.dialog(serverErrorOptions).open();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            } catch (e){
                                                                var jsonErrorOptions = {
                                                                    content: "不正确的json数据格式",
                                                                    formCheck: true
                                                                }
                                                                api.ui.dialog(jsonErrorOptions).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {

                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        })

                                        var $requestCreateObjBtn = $('#requestParam').find('.createObjBtn');
                                        $requestCreateObjBtn.on('click', function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectClassName" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象名称',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '确定', fn: function () {
                                                            var objectClassName = $('input[name=objectClassName]').val();
                                                            if(objectClassName && $.trim(objectClassName) != ''){
                                                                var data = requestParam.toData();
                                                                $.ajax({
                                                                    url: api.util.getUrl('/apimanager/object/field/createObj'),
                                                                    type: 'post',
                                                                    data : JSON.stringify({'fieldInfoValue': JSON.stringify(data), 'classWholeName': objectClassName}),
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    success: function (result) {
                                                                        var code = result.code;
                                                                        if(code == '-1'){
                                                                            var options = {
                                                                                content: '对象创建失败！'
                                                                            };
                                                                            api.ui.dialog(options).open();
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                var options = {
                                                                    content: '对象名称不能为空！'
                                                                };
                                                                api.ui.dialog(options).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        });

                                        var $responseCreateObjBtn = $('#responseParam').find('.createObjBtn');
                                        $responseCreateObjBtn.on('click', function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectClassName" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象名称',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '确定', fn: function () {
                                                            var objectClassName = $('input[name=objectClassName]').val();
                                                            if(objectClassName && $.trim(objectClassName) != ''){
                                                                var data = responseParam.toData();
                                                                $.ajax({
                                                                    url: api.util.getUrl('/apimanager/object/field/createObj'),
                                                                    type: 'post',
                                                                    data : JSON.stringify({'fieldInfoValue': JSON.stringify(data), 'classWholeName': objectClassName}),
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    success: function (result) {
                                                                        var code = result.code;
                                                                        if(code == '-1'){
                                                                            var options = {
                                                                                content: '对象创建失败！'
                                                                            };
                                                                            api.ui.dialog(options).open();
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                var options = {
                                                                    content: '对象名称不能为空！'
                                                                };
                                                                api.ui.dialog(options).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        });

                                        var $requestImportDescBtn = $('#requestParam').find('.importDescBtn');
                                        $requestImportDescBtn.on('click',function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectDescNames" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象参数',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var objectDescNames = $('input[name=objectDescNames]').val();
                                                            if(objectDescNames && $.trim(objectDescNames) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/object/field/findObjectInfoByClassWholeNames'),
                                                                    type: 'GET',
                                                                    data : {'classWholeNames': objectDescNames},
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        $.each(data, function (index, rowData) {
                                                                            requestParam._showRow(rowData);
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    var options = {
                                                        container: modalBody.find('input[name=objectDescNames]'),
                                                        url: api.util.getUrl('apimanager/object/field/listObjectNames'),
                                                        multiItem: false,
                                                        appendTo: modalBody
                                                    }
                                                    api.ui.autocomplete(options);
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        })
                                        var $responseImportDescBtn = $('#responseParam').find('.importDescBtn');
                                        $responseImportDescBtn.on('click',function () {
                                            var dialogOptions = {
                                                container: 'body',
                                                content: '<input class="col-12 form-control" name="objectDescNames" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                                iTitle: false,
                                                title: '对象备注',
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var objectDescNames = $('input[name=objectDescNames]').val();
                                                            if(objectDescNames && $.trim(objectDescNames) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/object/field/findObjectDescByClassWholeNames'),
                                                                    type: 'GET',
                                                                    data : {'classWholeNames': objectDescNames},
                                                                    dataType: 'json',
                                                                    async: false,
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        responseParam.giveDesc(data);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    var options = {
                                                        container: modalBody.find('input[name=objectDescNames]'),
                                                        url: api.util.getUrl('apimanager/object/field/listObjectNames'),
                                                        appendTo: modalBody
                                                    }
                                                    api.ui.autocomplete(options);
                                                }
                                            };
                                            api.ui.dialog(dialogOptions).open();
                                        })
                                        var $responseImportBtn = $('#responseParam').find('.importBtn');
                                        $responseImportBtn.on('click',function () {
                                            var $templateBtnDiv = $('<div></div>');
                                            var $addTempBtn = $('<button type="button" class="btn btn-success btn-sm addTempBtn">生成模板</button>');
                                            $templateBtnDiv.append($addTempBtn);
                                            $.ajax({
                                                url: api.util.getUrl('apimanager/template/list'),
                                                type: 'get',
                                                data : {'templateType': 2},
                                                dataType: 'json',
                                                async: false,
                                                success: function (result) {
                                                    var datas = result.data;
                                                    $.each(datas, function (index, data) {
                                                        var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                        $templateBtn.text(data['templateName']);
                                                        $templateBtn.attr('primaryId', data['id']);
                                                        $templateBtn.attr('templateContent', data['templateContent']);
                                                        $templateBtnDiv.append($templateBtn);
                                                    })
                                                }
                                            });
                                            var dialogOptions = {
                                                container: 'body',
                                                content: $templateBtnDiv.html() + '<textarea class="col-12 form-control" name="responseJson" style="height: 300px; margin-top: 2px;"></textarea>',
                                                iTitle: false,
                                                title: '响应参数',
                                                formCheck: true,
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            //校验导入参数是否是json类型
                                                            try {
                                                                if (typeof JSON.parse(importJson) == "object") {
                                                                    if(importJson && $.trim(importJson) != ''){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                            type: 'post',
                                                                            data : importJson,
                                                                            contentType : 'application/json;charset=utf-8',
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var code = result.code;
                                                                                if(code == '0'){
                                                                                    var data = result.data;
                                                                                    $.each(JSON.parse(data), function (index, rowData) {
                                                                                        responseParam._showRow(rowData);
                                                                                    })
                                                                                } else {
                                                                                    var serverErrorOptions = {
                                                                                        content: "导入失败！",
                                                                                        formCheck: true
                                                                                    }
                                                                                    api.ui.dialog(serverErrorOptions).open();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            } catch (e){
                                                                var jsonErrorOptions = {
                                                                    content: "不正确的json数据格式",
                                                                    formCheck: true
                                                                }
                                                                api.ui.dialog(jsonErrorOptions).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    modalBody.find('.addTempBtn').on('click', function () {
                                                        var that = $(this);
                                                        var content = modalBody.find('textarea[name=responseJson]').val();
                                                        if(!content || $.trim(content).length == 0){
                                                            var options = {
                                                                content: '模板内容不能为空！'
                                                            };
                                                            api.ui.dialog(options).open();
                                                            return;
                                                        }
                                                        var options = {
                                                            content: '<input type="text" class="form-control" name="templateName" placeholder="模板名称，如：ret-result">',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function (innerModalBody) {
                                                                        var templateName = innerModalBody.find('input[name=templateName]').val();
                                                                        if(templateName && $.trim(templateName).length > 0){
                                                                            $.ajax({
                                                                                url: api.util.getUrl('apimanager/template/add'),
                                                                                type: 'GET',
                                                                                data: {'templateName': templateName,'templateContent': content, 'templateType': 2},
                                                                                dataType: 'json',
                                                                                success: function (result) {
                                                                                    var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                                                    $templateBtn.text(templateName);
                                                                                    $templateBtn.attr('primaryId', result['data']);
                                                                                    $templateBtn.attr('templateContent', content);
                                                                                    modalBody.find('textarea[name=responseJson]').before($templateBtn);
                                                                                    modalBody.find('textarea[name=responseJson]').val('');
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    });
                                                    var clickTimeId;
                                                    var templateBtnClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        clickTimeId = setTimeout(function () {
                                                            var content = modalBody.find('textarea[name=responseJson]').val(), that = $(event.target);
                                                            if(content && $.trim(content).length > 0){
                                                                var contentObj = JSON.parse(content);
                                                                var templateContent = JSON.parse(that.attr('templateContent'));
                                                                Object.keys(templateContent).forEach(function(key) {
                                                                    if(typeof templateContent[key] === 'object'){
                                                                        templateContent[key] = contentObj;
                                                                    };
                                                                });
                                                                var templateBString = JSON.stringify(templateContent, null, 4);
                                                                modalBody.find('textarea[name=responseJson]').val(templateBString);
                                                            } else {
                                                                var templateContent = JSON.parse(that.attr('templateContent'));
                                                                var templateBString = JSON.stringify(templateContent, null, 4);
                                                                modalBody.find('textarea[name=responseJson]').val(templateBString);
                                                            }
                                                        }, 250);
                                                    }
                                                    var templateBtnDbClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        var that = $(event.target);
                                                        var options = {
                                                            content: '确认删除模板？',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function () {
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/template/delete'),
                                                                            type: 'GET',
                                                                            data: {'id': that.attr('primaryId')},
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                that.remove();
                                                                            }
                                                                        });
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    }
                                                    modalBody.on('click', '.templateBtn', templateBtnClick);
                                                    modalBody.on('dblclick', '.templateBtn', templateBtnDbClick);
                                                }
                                            };
                                            var importDialog = api.ui.dialog(dialogOptions).open();
                                        })
                                        var $responseFailImportBtn = $('#responseFailParam').find('.importBtn');
                                        $responseFailImportBtn.on('click',function () {
                                            var $templateBtnDiv = $('<div></div>');
                                            var $addTempBtn = $('<button type="button" class="btn btn-success btn-sm addTempBtn">生成模板</button>');
                                            $templateBtnDiv.append($addTempBtn);
                                            $.ajax({
                                                url: api.util.getUrl('apimanager/template/list'),
                                                type: 'get',
                                                data : {'templateType': 3},
                                                dataType: 'json',
                                                async: false,
                                                success: function (result) {
                                                    var datas = result.data;
                                                    $.each(datas, function (index, data) {
                                                        var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                        $templateBtn.text(data['templateName']);
                                                        $templateBtn.attr('primaryId', data['id']);
                                                        $templateBtn.attr('templateContent', data['templateContent']);
                                                        $templateBtnDiv.append($templateBtn);
                                                    })
                                                }
                                            });
                                            var dialogOptions = {
                                                container: 'body',
                                                content: $templateBtnDiv.html() + '<textarea class="col-12 form-control" name="responseJson" style="height: 300px; margin-top: 2px;"></textarea>',
                                                iTitle: false,
                                                title: '响应参数',
                                                formCheck: true,
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            //校验导入参数是否是json类型
                                                            try {
                                                                if (typeof JSON.parse(importJson) == "object") {
                                                                    if(importJson && $.trim(importJson) != ''){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                            type: 'post',
                                                                            data : importJson,
                                                                            contentType : 'application/json;charset=utf-8',
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var code = result.code;
                                                                                if(code == '0'){
                                                                                    var data = result.data;
                                                                                    $.each(JSON.parse(data), function (index, rowData) {
                                                                                        responseFailParam._showRow(rowData);
                                                                                    })
                                                                                } else {
                                                                                    var serverErrorOptions = {
                                                                                        content: "导入失败！",
                                                                                        formCheck: true
                                                                                    }
                                                                                    api.ui.dialog(serverErrorOptions).open();
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            } catch (e){
                                                                var jsonErrorOptions = {
                                                                    content: "不正确的json数据格式",
                                                                    formCheck: true
                                                                }
                                                                api.ui.dialog(jsonErrorOptions).open();
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {
                                                    modalBody.find('.addTempBtn').on('click', function () {
                                                        var that = $(this);
                                                        var content = modalBody.find('textarea[name=responseJson]').val();
                                                        if(!content || $.trim(content).length == 0){
                                                            var options = {
                                                                content: '模板内容不能为空！'
                                                            };
                                                            api.ui.dialog(options).open();
                                                            return;
                                                        }
                                                        var options = {
                                                            content: '<input type="text" class="form-control" name="templateName" placeholder="模板名称，如：ret-result">',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function (innerModalBody) {
                                                                        var templateName = innerModalBody.find('input[name=templateName]').val();
                                                                        if(templateName && $.trim(templateName).length > 0){
                                                                            $.ajax({
                                                                                url: api.util.getUrl('apimanager/template/add'),
                                                                                type: 'GET',
                                                                                data: {'templateName': templateName,'templateContent': content, 'templateType': 3},
                                                                                dataType: 'json',
                                                                                success: function (result) {
                                                                                    var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                                                    $templateBtn.text(templateName);
                                                                                    $templateBtn.attr('primaryId', result['data']);
                                                                                    $templateBtn.attr('templateContent', content);
                                                                                    modalBody.find('textarea[name=responseJson]').before($templateBtn);
                                                                                    modalBody.find('textarea[name=responseJson]').val('');
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    });
                                                    var clickTimeId;
                                                    var templateBtnClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        clickTimeId = setTimeout(function () {
                                                            var $textAreaObj = modalBody.find('textarea[name=responseJson]'), that = $(event.target);
                                                            $textAreaObj.val('');
                                                            var templateContent = JSON.parse(that.attr('templateContent'));
                                                            var templateBString = JSON.stringify(templateContent, null, 4);
                                                            $textAreaObj.val(templateBString);
                                                        }, 250);
                                                    };
                                                    var templateBtnDbClick = function (event) {
                                                        clearTimeout(clickTimeId);
                                                        var that = $(event.target);
                                                        var options = {
                                                            content: '确认删除模板？',
                                                            buttons: [
                                                                {
                                                                    text: '确定', type: 'sure', fn: function () {
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/template/delete'),
                                                                            type: 'GET',
                                                                            data: {'id': that.attr('primaryId')},
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                that.remove();
                                                                            }
                                                                        });
                                                                    }
                                                                },
                                                                {
                                                                    text: '取消', type: 'cancel'
                                                                }
                                                            ]
                                                        };
                                                        api.ui.dialog(options).open();
                                                    }
                                                    modalBody.on('click', '.templateBtn', templateBtnClick);
                                                    modalBody.on('dblclick', '.templateBtn', templateBtnDbClick);
                                                }
                                            };
                                            var importDialog = api.ui.dialog(dialogOptions).open();
                                        })
                                    });
                                    progress._hide();
                                }
                            }]
                        };
                        var actionTabConfObject = api.ui.tabs(actionTabConf);
                        //退出添加
                        $cancelButton.mousedown(function () {
                            //跳转到action列表
                            var conf = {
                                container: '#container',
                                url: api.util.getUrl('html/action/action.html'),
                                content: "",
                                async: false,
                                preLoad: function () {
                                    $("#depart").empty();
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"departmentClick()\">Department</a></li>");
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"projectClick1()\">Project</a></li>");
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                                    $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"actionClick1()\">Action</a></li>");
                                },
                                loaded: function (param) {
                                    var depOptions = {
                                        selector: '[name=depId]',
                                        optionField: {value: 'id', text: 'depName'},
                                        width: '70%',
                                        async: false,
                                        url: api.util.getUrl('apimanager/department/list'),
                                        change: function (e, p) {
                                            var params = {};
                                            params['depId'] = e.target.value;
                                            var projectOptions = {
                                                selector: '[name=projectId]',
                                                optionField: {value: 'id', text: 'projectName'},
                                                width: '70%',
                                                async: false,
                                                params: params,
                                                url: api.util.getUrl('apimanager/project/list'),
                                                change: function (e, p) {
                                                    var params = {};
                                                    params['projectId'] = e.target.value;
                                                    var moduleOptions = {
                                                        selector: '[name=moduleId]',
                                                        optionField: {value: 'id', text: 'moduleName'},
                                                        width: '70%',
                                                        async: false,
                                                        params: params,
                                                        url: api.util.getUrl('apimanager/module/list')
                                                    };
                                                    var moduleSelect = api.ui.chosenSelect(moduleOptions);
                                                    moduleSelect.val(parentId);
                                                }
                                            };
                                            var projectSelect = api.ui.chosenSelect(projectOptions);
                                            projectSelect.val(projectId);
                                            projectSelect.doChange();
                                        }
                                    };

                                    var depSelect = api.ui.chosenSelect(depOptions);
                                    depSelect.val(depId);
                                    depSelect.doChange();
                                    var createUserOptions = {
                                        selector: '[name=createUser]',
                                        optionField: {value: 'id', text: 'userName'},
                                        width: '50%',
                                        selectedVal: createUserSelect,
                                        async: false,
                                        blank: true,
                                        url: api.util.getUrl('apimanager/user/list')
                                    }
                                    var createSelect = api.ui.chosenSelect(createUserOptions);
                                    api.util.loadScript(api.util.getUrl("html/action/js/action.js") ,function () {
                                        api.ui.editTable(actionTableOptions);
                                    });
                                }
                            }
                            api.ui.load(conf);
                        });
                        //保存
                        $('#headButton button:last').on('click', function () {
                            //表单非空校验
                            var i = 0;
                            $('#actionInfoForm').find('input,select').each(function(){
                                var $this = $(this), value = $.trim($this.val());
                                if($this.attr('required') && !value){
                                    i = 1;
                                    $this.css('border-color','red');
                                    $this.on('blur',function () {
                                        if($.trim($this.val())){
                                            $this.css('border-color','');
                                        }
                                    })
                                    return true;
                                }

                            });
                            if(i == 1){
                                var option = {content: '请完善接口基本信息'};
                                api.ui.dialog(option).open();
                                actionTabConfObject.show('基本信息');
                                return;
                            }
                            if(headParam._checkEmpty() || requestParam._checkEmpty()
                                || responseParam._checkEmpty() || responseFailParam._checkEmpty()
                                || headParam.defaultFlag == 1 || requestParam.defaultFlag == 1
                                || responseParam.defaultFlag == 1 || responseFailParam.defaultFlag == 1){
                                var option = {content: '请完善接口参数信息'};
                                api.ui.dialog(option).open();
                                return;
                            }
                            var headArr = headParam.toData();
                            var requestArr = requestParam.toData();
                            var responseArr = responseParam.toData();
                            var responseFailAttr = responseFailParam.toData();
                            var requestData = actionInfoFormObject.toJson();
                            requestData['requestHeadDefinition'] = JSON.stringify(headArr);
                            requestData['requestDefinition'] = JSON.stringify(requestArr);
                            requestData['responseDefinition'] = JSON.stringify(responseArr);
                            requestData['responseFailDefinition'] = JSON.stringify(responseFailAttr);
                            $.ajax({
                                type: 'post',
                                url: api.util.getUrl('apimanager/action/add'),
                                dataType: 'json',
                                data : JSON.stringify(requestData),
                                contentType : 'application/json;charset=utf-8',
                                success: function (data) {
                                    if(data.code == -1){
                                        var option={
                                            content: '<span id="sigleErrorMsg" class="glyphicon glyphicon-remove" style="cursor: pointer;">&nbsp;保存失败，点击查看详细</span><p></p><textarea readonly class="form-control" id="stackTrace" style="display: none; width: 100%; height: 400px;font-size: small;color: red;"></textarea>',
                                            width: '150%',
                                            opened: function (modalBody) {
                                                modalBody.find('#sigleErrorMsg').on('click', function () {
                                                    var $stackTrace = modalBody.find('#stackTrace');
                                                    if($stackTrace.css('display') == 'none') {
                                                        $stackTrace.css('display', 'block');
                                                    } else {
                                                        $stackTrace.css('display', 'none');
                                                    }
                                                    modalBody.find('#stackTrace').val(data.stackTrace);
                                                });
                                            }
                                        };
                                        api.ui.dialog(option).open();
                                        return;
                                    }
                                    //跳转到action列表
                                    var conf = {
                                        container: '#container',
                                        url: api.util.getUrl('html/action/action.html'),
                                        async: false,
                                        preLoad: function () {
                                            $("#depart").empty();
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"departmentClick()\">Department</a></li>");
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"projectClick1()\">Project</a></li>");
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                                            $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"actionClick1()\">Action</a></li>");
                                        },
                                        loaded: function () {
                                            var depOptions = {
                                                selector: '[name=depId]',
                                                optionField: {value: 'id', text: 'depName'},
                                                width: '70%',
                                                async: false,
                                                url: api.util.getUrl('apimanager/department/list'),
                                                change: function (e, p) {
                                                    var params = {};
                                                    params['depId'] = e.target.value;
                                                    var projectOptions = {
                                                        selector: '[name=projectId]',
                                                        optionField: {value: 'id', text: 'projectName'},
                                                        width: '70%',
                                                        async: false,
                                                        params: params,
                                                        url: api.util.getUrl('apimanager/project/list'),
                                                        change: function (e, p) {
                                                            var params = {};
                                                            params['projectId'] = e.target.value;
                                                            var moduleOptions = {
                                                                selector: '[name=moduleId]',
                                                                optionField: {value: 'id', text: 'moduleName'},
                                                                width: '70%',
                                                                async: false,
                                                                params: params,
                                                                url: api.util.getUrl('apimanager/module/list')
                                                            };
                                                            var moduleSelect = api.ui.chosenSelect(moduleOptions);
                                                            moduleSelect.val(parentId);
                                                        }
                                                    };
                                                    var projectSelect = api.ui.chosenSelect(projectOptions);
                                                    projectSelect.val(projectId);
                                                    projectSelect.doChange();
                                                }
                                            };

                                            var depSelect = api.ui.chosenSelect(depOptions);
                                            depSelect.val(depId);
                                            depSelect.doChange();
                                            var createUserOptions = {
                                                selector: '[name=createUser]',
                                                optionField: {value: 'id', text: 'userName'},
                                                width: '50%',
                                                selectedVal: createUserSelect,
                                                async: false,
                                                blank: true,
                                                url: api.util.getUrl('apimanager/user/list')
                                            }
                                            var createSelect = api.ui.chosenSelect(createUserOptions);
                                            api.util.loadScript(api.util.getUrl("html/action/js/action.js") ,function () {
                                                api.ui.editTable(actionTableOptions);
                                            });
                                        }
                                    }
                                    api.ui.load(conf);
                                }
                            });
                        });
                    }
                };
                api.ui.load(conf);
        }
        },
        {type: 'history', text: '最新修改', icon: 'glyphicon glyphicon-pencil', fn: function (param) {
                var dialogOptions = {
                    container: 'body',
                    content: '<div id="baseInfoDiv" style="padding-left: 0px; padding-right: 0px;">' +
                    '<p style="color: red;">基本信息变化</p>' +
                    '<table class="table table-sm" style="margin-left: 0px; margin-right: 0px; font-size: 14px;">' +
                    '<thead>' +
                    '<tr>' +
                    '<th style="width: 15%;">名称</th>' +
                    '<th style="width: 15%;">类型</th>' +
                    '<th style="width: 70%;">内容变化</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>' +
                    '<div id="paramsInfoDiv" style="padding-left: 0px; padding-right: 0px;">' +
                    '<p style="color: red;">参数信息变化</p>' +
                    '<table class="table table-sm" style="margin-left: 0px; margin-right: 0px; font-size: 14px;">' +
                    '<thead>' +
                    '<tr>' +
                    '<th style="width: 15%;">名称</th>' +
                    '<th style="width: 15%;">类型</th>' +
                    '<th style="width: 70%;">内容变化</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody></tbody>' +
                    '</table>' +
                    '</div>',
                    iTitle: false,
                    title: '最近修改',
                    width: '180%',
                    opened: function (modalBody) {
                        $.ajax({
                            type: 'get',
                            url: api.util.getUrl('/apimanager/actionhistory/compareHistoryDiff'),
                            data: {actionId: param.id},
                            dataType: "json",
                            async: false,
                            contentType: 'json',
                            success: function (result) {
                                var baseInfoChange = result.data.baseInfoChange;
                                if(baseInfoChange){
                                    var $tbody = modalBody.find('#baseInfoDiv tbody');
                                    $.each(baseInfoChange, function (index, value) {
                                        var $tr = $('<tr></tr>');
                                        $tr.append('<td>' + value.fieldName + '</td>');
                                        $tr.append('<td>修改</td>');
                                        $tr.append('<td>' + value.modifyStr + '</td>');
                                        $tbody.append($tr);
                                    })
                                }
                                var paramsInfoChange = result.data.paramsInfoChange;
                                if(paramsInfoChange){
                                    var $tbody = modalBody.find('#paramsInfoDiv tbody');
                                    $.each(paramsInfoChange, function (index, value) {
                                        var $tr = $('<tr></tr>');
                                        $tr.append('<td>' + value.fieldName + '</td>');
                                        $tr.append('<td>' + value.operateDesc + '</td>');
                                        $tr.append('<td>' + value.modifyStr + '</td>');
                                        $tbody.append($tr);
                                    })
                                }
                            }
                        });
                    }
                };
                api.ui.dialog(dialogOptions).open();
            }},
        {type: 'delete', text: '删除', url: api.util.getUrl('apimanager/action/delete')}
],
    headBtn: [
    {
        type: 'add-jump', text: '添加', icon: 'glyphicon glyphicon-plus', fn: function () {
            $('#depart').empty();
            var parentId = $('select[name=moduleId]').val();
            var depId = $('select[name=depId]').val();
            var projectId = $('select[name=projectId]').val();
            var createUserSelect = $('select[name=createUser]').val();
            var actionInfoFormObject, headParam, requestParam, responseParam, responseFailParam;
            var conf = {
                container: '#container',
                url: api.util.getUrl('html/action/actionTab.html'),
                content: "",
                async: false,
                preLoad: function () {},
                loaded: function () {
                    var $editChange = $('#editChange');
                    var $cancelButton = $('#cancelButton'),$saveButton = $('#saveButton');
                    $editChange.css('display','none');
                    var actionTabConf = {
                        container: '#tabs',
                        tabs: [{
                            title: '基本信息',
                            width: '10%',
                            href: api.util.getUrl('html/action/actionInfo.html'),
                            loaded: function () {
                                api.util.loadScript(api.util.getUrl('html/action/js/actionInfo.js'), function () {
                                    api.ui.chosenSelect(domainSelectOptions);
                                    api.ui.chosenSelect(typeSelectOption);
                                    api.ui.chosenSelect(statusSelectOption);
                                    api.ui.chosenSelect(actionLevelSelectOption);
                                    api.ui.chosenSelect(moduleOptions);
                                    // api.ui.chosenSelect(testGroupSelectOption);
                                    actionInfoFormObject = api.ui.form(actionInfoFormOptions);
                                    actionInfoFormObject.giveVal({
                                        moduleId: parentId,
                                        status: 1,
                                        requestType: 1
                                    });

                                });
                            }
                        }, {
                            title: '接口参数',
                            width: '10%',
                            lazy: false,
                            href: api.util.getUrl('html/action/actionParam.html'),
                            loaded: function () {
                                api.util.loadScript(api.util.getUrl('html/action/js/actionParam.js'), function () {
                                    headParam = api.ui.param(headOptions);
                                    requestParam = api.ui.param(requestOptions);
                                    responseParam = api.ui.param(responseOptions);
                                    responseFailParam = api.ui.param(responseFailOptions);
                                    var $requestImportBtn = $('#requestParam').find('.importBtn');
                                    var $requestImportDescBtn = $('#requestParam').find('.importDescBtn');
                                    $requestImportBtn.on('click',function () {
                                        var dialogOptions = {
                                            container: 'body',
                                            content: '<textarea class="col-12 form-control" name="requestJson" style="height: 300px;"></textarea>',
                                            iTitle: false,
                                            title: '请求参数',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '导入', fn: function () {
                                                        var importJson = $('textarea[name=requestJson]').val();
                                                        //校验导入参数是否是json类型
                                                        try {
                                                            if (typeof JSON.parse(importJson) == "object") {
                                                                if(importJson && $.trim(importJson) != ''){
                                                                    $.ajax({
                                                                        url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                        type: 'post',
                                                                        data : importJson,
                                                                        contentType : 'application/json;charset=utf-8',
                                                                        dataType: 'json',
                                                                        success: function (result) {
                                                                            var code = result.code;
                                                                            if(code == '0'){
                                                                                var data = result.data;
                                                                                $.each(JSON.parse(data), function (index, rowData) {
                                                                                    requestParam._showRow(rowData);
                                                                                })
                                                                            } else {
                                                                                var serverErrorOptions = {
                                                                                    content: "导入失败！",
                                                                                    formCheck: true
                                                                                }
                                                                                api.ui.dialog(serverErrorOptions).open();
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        } catch (e){
                                                            var jsonErrorOptions = {
                                                                content: "不正确的json数据格式",
                                                                formCheck: true
                                                            }
                                                            api.ui.dialog(jsonErrorOptions).open();
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {

                                            }
                                        };
                                        api.ui.dialog(dialogOptions).open();
                                    })
                                    $requestImportDescBtn.on('click',function () {
                                        var dialogOptions = {
                                            container: 'body',
                                            content: '<input class="col-12 form-control" name="objectDescNames" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                            iTitle: false,
                                            title: '对象参数',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '导入', fn: function () {
                                                        var objectDescNames = $('input[name=objectDescNames]').val();
                                                        if(objectDescNames && $.trim(objectDescNames) != ''){
                                                            $.ajax({
                                                                url: api.util.getUrl('apimanager/object/field/findObjectInfoByClassWholeNames'),
                                                                type: 'GET',
                                                                data : {'classWholeNames': objectDescNames},
                                                                dataType: 'json',
                                                                async: false,
                                                                success: function (result) {
                                                                    var data = result.data;
                                                                    $.each(data, function (index, rowData) {
                                                                        requestParam._showRow(rowData);
                                                                    })
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {
                                                var options = {
                                                    container: modalBody.find('input[name=objectDescNames]'),
                                                    url: api.util.getUrl('apimanager/object/field/listObjectNames'),
                                                    multiItem: false,
                                                    appendTo: modalBody
                                                }
                                                api.ui.autocomplete(options);
                                            }
                                        };
                                        api.ui.dialog(dialogOptions).open();
                                    })

                                    var $requestCreateObjBtn = $('#requestParam').find('.createObjBtn');
                                    $requestCreateObjBtn.on('click', function () {
                                        var dialogOptions = {
                                            container: 'body',
                                            content: '<input class="col-12 form-control" name="objectClassName" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                            iTitle: false,
                                            title: '对象名称',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '确定', fn: function () {
                                                        var objectClassName = $('input[name=objectClassName]').val();
                                                        if(objectClassName && $.trim(objectClassName) != ''){
                                                            var data = requestParam.toData();
                                                            $.ajax({
                                                                url: api.util.getUrl('/apimanager/object/field/createObj'),
                                                                type: 'post',
                                                                data : JSON.stringify({'fieldInfoValue': JSON.stringify(data), 'classWholeName': objectClassName}),
                                                                dataType: 'json',
                                                                async: false,
                                                                contentType : 'application/json;charset=utf-8',
                                                                success: function (result) {
                                                                    var code = result.code;
                                                                    if(code == '-1'){
                                                                        var options = {
                                                                            content: '对象创建失败！'
                                                                        };
                                                                        api.ui.dialog(options).open();
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            var options = {
                                                                content: '对象名称不能为空！'
                                                            };
                                                            api.ui.dialog(options).open();
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {
                                            }
                                        };
                                        api.ui.dialog(dialogOptions).open();
                                    });

                                    var $responseCreateObjBtn = $('#responseParam').find('.createObjBtn');
                                    $responseCreateObjBtn.on('click', function () {
                                        var dialogOptions = {
                                            container: 'body',
                                            content: '<input class="col-12 form-control" name="objectClassName" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                            iTitle: false,
                                            title: '对象名称',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '确定', fn: function () {
                                                        var objectClassName = $('input[name=objectClassName]').val();
                                                        if(objectClassName && $.trim(objectClassName) != ''){
                                                            var data = responseParam.toData();
                                                            $.ajax({
                                                                url: api.util.getUrl('/apimanager/object/field/createObj'),
                                                                type: 'post',
                                                                data : JSON.stringify({'fieldInfoValue': JSON.stringify(data), 'classWholeName': objectClassName}),
                                                                dataType: 'json',
                                                                async: false,
                                                                contentType : 'application/json;charset=utf-8',
                                                                success: function (result) {
                                                                    var code = result.code;
                                                                    if(code == '-1'){
                                                                        var options = {
                                                                            content: '对象创建失败！'
                                                                        };
                                                                        api.ui.dialog(options).open();
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            var options = {
                                                                content: '对象名称不能为空！'
                                                            };
                                                            api.ui.dialog(options).open();
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {
                                            }
                                        };
                                        api.ui.dialog(dialogOptions).open();
                                    });

                                    var $responseImportBtn = $('#responseParam').find('.importBtn');
                                    $responseImportBtn.on('click',function () {
                                        var $templateBtnDiv = $('<div></div>');
                                        var $addTempBtn = $('<button type="button" class="btn btn-success btn-sm addTempBtn">生成模板</button>');
                                        $templateBtnDiv.append($addTempBtn);
                                        $.ajax({
                                            url: api.util.getUrl('apimanager/template/list'),
                                            type: 'get',
                                            data : {'templateType': 2},
                                            dataType: 'json',
                                            async: false,
                                            success: function (result) {
                                                var datas = result.data;
                                                $.each(datas, function (index, data) {
                                                    var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                    $templateBtn.text(data['templateName']);
                                                    $templateBtn.attr('primaryId', data['id']);
                                                    $templateBtn.attr('templateContent', data['templateContent']);
                                                    $templateBtnDiv.append($templateBtn);
                                                })
                                            }
                                        });
                                        var dialogOptions = {
                                            container: 'body',
                                            content: $templateBtnDiv.html() + '<textarea class="col-12 form-control" name="responseJson" style="height: 300px; margin-top: 2px;"></textarea>',
                                            iTitle: false,
                                            title: '响应参数',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '导入', fn: function () {
                                                        var importJson = $('textarea[name=responseJson]').val();
                                                        //校验导入参数是否是json类型
                                                        try {
                                                            if (typeof JSON.parse(importJson) == "object") {
                                                                if(importJson && $.trim(importJson) != ''){
                                                                    $.ajax({
                                                                        url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                        type: 'post',
                                                                        data : importJson,
                                                                        contentType : 'application/json;charset=utf-8',
                                                                        dataType: 'json',
                                                                        success: function (result) {
                                                                            var code = result.code;
                                                                            if(code == '0'){
                                                                                var data = result.data;
                                                                                $.each(JSON.parse(data), function (index, rowData) {
                                                                                    responseParam._showRow(rowData);
                                                                                })
                                                                            } else {
                                                                                var serverErrorOptions = {
                                                                                    content: "导入失败！",
                                                                                    formCheck: true
                                                                                }
                                                                                api.ui.dialog(serverErrorOptions).open();
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        } catch (e){
                                                            var jsonErrorOptions = {
                                                                content: "不正确的json数据格式",
                                                                formCheck: true
                                                            }
                                                            api.ui.dialog(jsonErrorOptions).open();
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {
                                                modalBody.find('.addTempBtn').on('click', function () {
                                                    var that = $(this);
                                                    var content = modalBody.find('textarea[name=responseJson]').val();
                                                    if(!content || $.trim(content).length == 0){
                                                        var options = {
                                                            content: '模板内容不能为空！'
                                                        };
                                                        api.ui.dialog(options).open();
                                                        return;
                                                    }
                                                    var options = {
                                                        content: '<input type="text" class="form-control" name="templateName" placeholder="模板名称，如：ret-result">',
                                                        buttons: [
                                                            {
                                                                text: '确定', type: 'sure', fn: function (innerModalBody) {
                                                                    var templateName = innerModalBody.find('input[name=templateName]').val();
                                                                    if(templateName && $.trim(templateName).length > 0){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/template/add'),
                                                                            type: 'GET',
                                                                            data: {'templateName': templateName,'templateContent': content, 'templateType': 2},
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                                                $templateBtn.text(templateName);
                                                                                $templateBtn.attr('primaryId', result['data']);
                                                                                $templateBtn.attr('templateContent', content);
                                                                                modalBody.find('textarea[name=responseJson]').before($templateBtn);
                                                                                modalBody.find('textarea[name=responseJson]').val('');
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                text: '取消', type: 'cancel'
                                                            }
                                                        ]
                                                    };
                                                    api.ui.dialog(options).open();
                                                });
                                                var clickTimeId;
                                                var templateBtnClick = function (event) {
                                                    clearTimeout(clickTimeId);
                                                    clickTimeId = setTimeout(function () {
                                                        var content = modalBody.find('textarea[name=responseJson]').val(), that = $(event.target);
                                                        if(content && $.trim(content).length > 0){
                                                            var contentObj = JSON.parse(content);
                                                            var templateContent = JSON.parse(that.attr('templateContent'));
                                                            Object.keys(templateContent).forEach(function(key) {
                                                                if(typeof templateContent[key] === 'object'){
                                                                    templateContent[key] = contentObj;
                                                                };
                                                            });
                                                            var templateBString = JSON.stringify(templateContent, null, 4);
                                                            modalBody.find('textarea[name=responseJson]').val(templateBString);
                                                        } else {
                                                            var templateContent = JSON.parse(that.attr('templateContent'));
                                                            var templateBString = JSON.stringify(templateContent, null, 4);
                                                            modalBody.find('textarea[name=responseJson]').val(templateBString);
                                                        }
                                                    }, 250);
                                                }
                                                var templateBtnDbClick = function (event) {
                                                    clearTimeout(clickTimeId);
                                                    var that = $(event.target);
                                                    var options = {
                                                        content: '确认删除模板？',
                                                        buttons: [
                                                            {
                                                                text: '确定', type: 'sure', fn: function () {
                                                                    $.ajax({
                                                                        url: api.util.getUrl('apimanager/template/delete'),
                                                                        type: 'GET',
                                                                        data: {'id': that.attr('primaryId')},
                                                                        dataType: 'json',
                                                                        success: function (result) {
                                                                            that.remove();
                                                                        }
                                                                    });
                                                                }
                                                            },
                                                            {
                                                                text: '取消', type: 'cancel'
                                                            }
                                                        ]
                                                    };
                                                    api.ui.dialog(options).open();
                                                }
                                                modalBody.on('click', '.templateBtn', templateBtnClick);
                                                modalBody.on('dblclick', '.templateBtn', templateBtnDbClick);
                                            }
                                        };
                                        var importDialog = api.ui.dialog(dialogOptions).open();
                                    })

                                    var $responseImportDescBtn = $('#responseParam').find('.importDescBtn');
                                    $responseImportDescBtn.on('click',function () {
                                        var dialogOptions = {
                                            container: 'body',
                                            content: '<input class="col-12 form-control" name="objectDescNames" type="text" placeholder="输入对象名称，如：equipment"></input>',
                                            iTitle: false,
                                            title: '对象备注',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '导入', fn: function () {
                                                        var objectDescNames = $('input[name=objectDescNames]').val();
                                                        if(objectDescNames && $.trim(objectDescNames) != ''){
                                                            $.ajax({
                                                                url: api.util.getUrl('apimanager/object/field/findObjectDescByClassWholeNames'),
                                                                type: 'GET',
                                                                data : {'classWholeNames': objectDescNames},
                                                                dataType: 'json',
                                                                async: false,
                                                                success: function (result) {
                                                                    var data = result.data;
                                                                    responseParam.giveDesc(data);
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {
                                                var options = {
                                                    container: modalBody.find('input[name=objectDescNames]'),
                                                    url: api.util.getUrl('apimanager/object/field/listObjectNames'),
                                                    appendTo: modalBody
                                                }
                                                api.ui.autocomplete(options);
                                            }
                                        };
                                        api.ui.dialog(dialogOptions).open();
                                    })
                                    var $responseFailImportBtn = $('#responseFailParam').find('.importBtn');
                                    $responseFailImportBtn.on('click',function () {
                                        var $templateBtnDiv = $('<div></div>');
                                        var $addTempBtn = $('<button type="button" class="btn btn-success btn-sm addTempBtn">生成模板</button>');
                                        $templateBtnDiv.append($addTempBtn);
                                        $.ajax({
                                            url: api.util.getUrl('apimanager/template/list'),
                                            type: 'get',
                                            data : {'templateType': 3},
                                            dataType: 'json',
                                            async: false,
                                            success: function (result) {
                                                var datas = result.data;
                                                $.each(datas, function (index, data) {
                                                    var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                    $templateBtn.text(data['templateName']);
                                                    $templateBtn.attr('primaryId', data['id']);
                                                    $templateBtn.attr('templateContent', data['templateContent']);
                                                    $templateBtnDiv.append($templateBtn);
                                                })
                                            }
                                        });
                                        var dialogOptions = {
                                            container: 'body',
                                            content: $templateBtnDiv.html() + '<textarea class="col-12 form-control" name="responseJson" style="height: 300px; margin-top: 2px;"></textarea>',
                                            iTitle: false,
                                            title: '响应参数',
                                            width: '150%',
                                            buttons:[
                                                {
                                                    type: 'close', text: '关闭', fn: function () {}
                                                },{
                                                    type: 'sure', text: '导入', fn: function () {
                                                        var importJson = $('textarea[name=responseJson]').val();
                                                        //校验导入参数是否是json类型
                                                        try {
                                                            if (typeof JSON.parse(importJson) == "object") {
                                                                if(importJson && $.trim(importJson) != ''){
                                                                    $.ajax({
                                                                        url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                        type: 'post',
                                                                        data : importJson,
                                                                        contentType : 'application/json;charset=utf-8',
                                                                        dataType: 'json',
                                                                        success: function (result) {
                                                                            var code = result.code;
                                                                            if(code == '0'){
                                                                                var data = result.data;
                                                                                $.each(JSON.parse(data), function (index, rowData) {
                                                                                    responseFailParam._showRow(rowData);
                                                                                })
                                                                            } else {
                                                                                var serverErrorOptions = {
                                                                                    content: "导入失败！",
                                                                                    formCheck: true
                                                                                }
                                                                                api.ui.dialog(serverErrorOptions).open();
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        } catch (e){
                                                            var jsonErrorOptions = {
                                                                content: "不正确的json数据格式",
                                                                formCheck: true
                                                            }
                                                            api.ui.dialog(jsonErrorOptions).open();
                                                        }
                                                    }
                                                }
                                            ],
                                            opened: function (modalBody) {
                                                modalBody.find('.addTempBtn').on('click', function () {
                                                    var that = $(this);
                                                    var content = modalBody.find('textarea[name=responseJson]').val();
                                                    if(!content || $.trim(content).length == 0){
                                                        var options = {
                                                            content: '模板内容不能为空！'
                                                        };
                                                        api.ui.dialog(options).open();
                                                        return;
                                                    }
                                                    var options = {
                                                        content: '<input type="text" class="form-control" name="templateName" placeholder="模板名称，如：ret-result">',
                                                        buttons: [
                                                            {
                                                                text: '确定', type: 'sure', fn: function (innerModalBody) {
                                                                    var templateName = innerModalBody.find('input[name=templateName]').val();
                                                                    if(templateName && $.trim(templateName).length > 0){
                                                                        $.ajax({
                                                                            url: api.util.getUrl('apimanager/template/add'),
                                                                            type: 'GET',
                                                                            data: {'templateName': templateName,'templateContent': content, 'templateType': 3},
                                                                            dataType: 'json',
                                                                            success: function (result) {
                                                                                var $templateBtn = $('<button type="button" class="btn btn-info btn-sm templateBtn" style="margin-left: 10px;"></button>');
                                                                                $templateBtn.text(templateName);
                                                                                $templateBtn.attr('primaryId', result['data']);
                                                                                $templateBtn.attr('templateContent', content);
                                                                                modalBody.find('textarea[name=responseJson]').before($templateBtn);
                                                                                modalBody.find('textarea[name=responseJson]').val('');
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                text: '取消', type: 'cancel'
                                                            }
                                                        ]
                                                    };
                                                    api.ui.dialog(options).open();
                                                });

                                                var clickTimeId;
                                                var templateBtnClick = function (event) {
                                                    clearTimeout(clickTimeId);
                                                    clickTimeId = setTimeout(function () {
                                                        var $textAreaObj = modalBody.find('textarea[name=responseJson]'), that = $(event.target);
                                                        $textAreaObj.val('');
                                                        var templateContent = JSON.parse(that.attr('templateContent'));
                                                        var templateBString = JSON.stringify(templateContent, null, 4);
                                                        $textAreaObj.val(templateBString);
                                                    }, 250);
                                                };
                                                var templateBtnDbClick = function (event) {
                                                    clearTimeout(clickTimeId);
                                                    var that = $(event.target);
                                                    var options = {
                                                        content: '确认删除模板？',
                                                        buttons: [
                                                            {
                                                                text: '确定', type: 'sure', fn: function () {
                                                                    $.ajax({
                                                                        url: api.util.getUrl('apimanager/template/delete'),
                                                                        type: 'GET',
                                                                        data: {'id': that.attr('primaryId')},
                                                                        dataType: 'json',
                                                                        success: function (result) {
                                                                            that.remove();
                                                                        }
                                                                    });
                                                                }
                                                            },
                                                            {
                                                                text: '取消', type: 'cancel'
                                                            }
                                                        ]
                                                    };
                                                    api.ui.dialog(options).open();
                                                }
                                                modalBody.on('click', '.templateBtn', templateBtnClick);
                                                modalBody.on('dblclick', '.templateBtn', templateBtnDbClick);
                                            }
                                        };
                                        var importDialog = api.ui.dialog(dialogOptions).open();
                                    })
                                });
                            }
                        }]
                    };
                    var actionTabConfObject = api.ui.tabs(actionTabConf);
                    //退出添加
                    $cancelButton.mousedown(function () {
                        //跳转到action列表
                        var conf = {
                            container: '#container',
                            url: api.util.getUrl('html/action/action.html'),
                            content: "",
                            async: false,
                            preLoad: function () {
                                $("#depart").empty();
                                $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"departmentClick()\">Department</a></li>");
                                $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"projectClick1()\">Project</a></li>");
                                $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                                $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"actionClick1()\">Action</a></li>");
                            },
                            loaded: function (param) {
                                var depOptions = {
                                    selector: '[name=depId]',
                                    optionField: {value: 'id', text: 'depName'},
                                    width: '70%',
                                    async: false,
                                    url: api.util.getUrl('apimanager/department/list'),
                                    change: function (e, p) {
                                        var params = {};
                                        params['depId'] = e.target.value;
                                        var projectOptions = {
                                            selector: '[name=projectId]',
                                            optionField: {value: 'id', text: 'projectName'},
                                            width: '70%',
                                            async: false,
                                            params: params,
                                            url: api.util.getUrl('apimanager/project/list'),
                                            change: function (e, p) {
                                                var params = {};
                                                params['projectId'] = e.target.value;
                                                var moduleOptions = {
                                                    selector: '[name=moduleId]',
                                                    optionField: {value: 'id', text: 'moduleName'},
                                                    width: '70%',
                                                    async: false,
                                                    params: params,
                                                    url: api.util.getUrl('apimanager/module/list')
                                                };
                                                var moduleSelect = api.ui.chosenSelect(moduleOptions);
                                                moduleSelect.val(parentId);
                                            }
                                        };
                                        var projectSelect = api.ui.chosenSelect(projectOptions);
                                        projectSelect.val(projectId);
                                        projectSelect.doChange();
                                    }
                                };

                                var depSelect = api.ui.chosenSelect(depOptions);
                                depSelect.val(depId);
                                depSelect.doChange();
                                var createUserOptions = {
                                    selector: '[name=createUser]',
                                    optionField: {value: 'id', text: 'userName'},
                                    width: '50%',
                                    selectedVal: createUserSelect,
                                    async: false,
                                    blank: true,
                                    url: api.util.getUrl('apimanager/user/list')
                                }
                                var createSelect = api.ui.chosenSelect(createUserOptions);
                                api.util.loadScript(api.util.getUrl("html/action/js/action.js") ,function () {
                                    api.ui.editTable(actionTableOptions);
                                });
                            }
                        }
                        api.ui.load(conf);
                    });
                    //保存
                    $('#headButton button:last').on('click', function () {
                        //表单非空校验
                        var i = 0;
                        $('#actionInfoForm').find('input,select').each(function(){
                            var $this = $(this), value = $.trim($this.val());
                            if($this.attr('required') && !value){
                                i = 1;
                                $this.css('border-color','red');
                                $this.on('blur',function () {
                                    if($.trim($this.val())){
                                        $this.css('border-color','');
                                    }
                                })
                                return true;
                            }
                        });
                        if(i == 1){
                            var option = {content: '请完善接口基本信息'};
                            api.ui.dialog(option).open();
                            actionTabConfObject.show('基本信息');
                            return;
                        }
                        if (headParam._checkEmpty() || requestParam._checkEmpty()
                            || responseParam._checkEmpty() || responseFailParam._checkEmpty()
                            || headParam.defaultFlag == 1 || requestParam.defaultFlag == 1
                            || responseParam.defaultFlag == 1 || responseFailParam.defaultFlag == 1) {
                            var option = {content: '请完善接口参数信息'};
                            api.ui.dialog(option).open();
                            return;
                        }
                        var headArr = headParam.toData();
                        var requestArr = requestParam.toData();
                        var responseArr = responseParam.toData();
                        var responseFailAttr = responseFailParam.toData();
                        var requestData = actionInfoFormObject.toJson();
                        requestData['requestHeadDefinition'] = JSON.stringify(headArr);
                        requestData['requestDefinition'] = JSON.stringify(requestArr);
                        requestData['responseDefinition'] = JSON.stringify(responseArr);
                        requestData['responseFailDefinition'] = JSON.stringify(responseFailAttr);
                        $.ajax({
                            type: 'post',
                            url: api.util.getUrl('apimanager/action/add'),
                            dataType: 'json',
                            data : JSON.stringify(requestData),
                            contentType : 'application/json;charset=utf-8',
                            success: function (data) {
                                if (data.code == '-1') {
                                    var option={
                                        content: '<span id="sigleErrorMsg" class="glyphicon glyphicon-remove" style="cursor: pointer;">&nbsp;保存失败，点击查看详细</span><p></p><textarea readonly class="form-control" id="stackTrace" style="display: none; width: 100%; height: 400px;font-size: small;color: red;"></textarea>',
                                        width: '150%',
                                        opened: function (modalBody) {
                                            modalBody.find('#sigleErrorMsg').on('click', function () {
                                                var $stackTrace = modalBody.find('#stackTrace');
                                                if($stackTrace.css('display') == 'none') {
                                                    $stackTrace.css('display', 'block');
                                                } else {
                                                    $stackTrace.css('display', 'none');
                                                }
                                                modalBody.find('#stackTrace').val(data.stackTrace);
                                            });
                                        }
                                    };
                                    api.ui.dialog(option).open();
                                    return;
                                }
                                //跳转到action列表
                                var conf = {
                                    container: '#container',
                                    url: api.util.getUrl('html/action/action.html'),
                                    async: false,
                                    preLoad: function () {
                                        $("#depart").empty();
                                        $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"departmentClick()\">Department</a></li>");
                                        $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"projectClick1()\">Project</a></li>");
                                        $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"moduleClick1()\">Module</a></li>");
                                        $("#depart").append("<li class=\"breadcrumb-item\"><a href=\"javasript:void(0)\" onclick=\"actionClick1()\">Action</a></li>");
                                    },
                                    loaded: function () {
                                        var depOptions = {
                                            selector: '[name=depId]',
                                            optionField: {value: 'id', text: 'depName'},
                                            width: '70%',
                                            async: false,
                                            url: api.util.getUrl('apimanager/department/list'),
                                            change: function (e, p) {
                                                var params = {};
                                                params['depId'] = e.target.value;
                                                var projectOptions = {
                                                    selector: '[name=projectId]',
                                                    optionField: {value: 'id', text: 'projectName'},
                                                    width: '70%',
                                                    async: false,
                                                    params: params,
                                                    url: api.util.getUrl('apimanager/project/list'),
                                                    change: function (e, p) {
                                                        var params = {};
                                                        params['projectId'] = e.target.value;
                                                        var moduleOptions = {
                                                            selector: '[name=moduleId]',
                                                            optionField: {value: 'id', text: 'moduleName'},
                                                            width: '70%',
                                                            async: false,
                                                            params: params,
                                                            url: api.util.getUrl('apimanager/module/list')
                                                        };
                                                        var moduleSelect = api.ui.chosenSelect(moduleOptions);
                                                        moduleSelect.val(parentId);
                                                    }
                                                };
                                                var projectSelect = api.ui.chosenSelect(projectOptions);
                                                projectSelect.val(projectId);
                                                projectSelect.doChange();
                                            }
                                        };

                                        var depSelect = api.ui.chosenSelect(depOptions);
                                        depSelect.val(depId);
                                        depSelect.doChange();
                                        var createUserOptions = {
                                            selector: '[name=createUser]',
                                            optionField: {value: 'id', text: 'userName'},
                                            width: '50%',
                                            selectedVal: createUserSelect,
                                            async: false,
                                            blank: true,
                                            url: api.util.getUrl('apimanager/user/list')
                                        }
                                        var createSelect = api.ui.chosenSelect(createUserOptions);
                                        api.util.loadScript(api.util.getUrl("html/action/js/action.js") ,function () {
                                            api.ui.editTable(actionTableOptions);
                                        });
                                    }
                                }
                                api.ui.load(conf);
                            }
                        });
                    });
                }
            };
            api.ui.load(conf);
        }
    }
],
    url: api.util.getUrl('apimanager/action/findPage')
};
