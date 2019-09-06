var actionHistoryTableOptions = {
    container: '#editTable',
    headers: [
        {text: '编号', width: '5%'},
        {text: '接口地址', width: '15%'},
        {text: '所属模块', width: '15%'},
        {text: '请求类型', width: '5%'},
        {text: '状态', width: '5%'},
        {text: '操作', width: '25%'}
    ],
    form: '#form',
    fields: [
        {name: 'id', type: 'input', inputDesc: '接口编号', required: false},
        {name: 'requestUrl', type: 'input', inputDesc: '接口地址', required: true},
        {name: 'moduleId', type:'select', inputDesc: '所属模块', required: true, options:{
                optionField: {value: 'id', text: 'moduleName'},
                async: false,
                url: api.util.getUrl('apimanager/module/list')
            }
        },
        {name: 'requestType', type:'select', inputDesc: '请求类型', required: true, options:{
                optionField: {value: 'k', text: 'v'},
                params:{metaId: 2},
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
        }
    ],
    rowButtons: [
        {type: 'more', text: '更多', icon: 'glyphicon glyphicon-option-horizontal', fn: function (param) {
                $('#depart').parent('.container-fluid').css('display', 'none');
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
                                        api.ui.chosenSelect(moduleOptions);
                                        api.ui.chosenSelect(domainSelectOptions);
                                        actionInfoFormObject = api.ui.form(actionInfoFormOptions);
                                        actionInfoFormObject.giveVal({
                                            id: data['id'],
                                            requestUrl: data['requestUrl'],
                                            actionName: data['actionName'],
                                            moduleId: data['moduleId'],
                                            requestType: data['requestType'],
                                            status: data['status'],
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
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            if(importJson && $.trim(importJson) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                    type: 'post',
                                                                    data : importJson,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    dataType: 'json',
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        $.each(JSON.parse(data), function (index, rowData) {
                                                                            requestParam._showRow(rowData);
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }
                                                ],
                                                opened: function (modalBody) {

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
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            if(importJson && $.trim(importJson) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                    type: 'post',
                                                                    data : importJson,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    dataType: 'json',
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        $.each(JSON.parse(data), function (index, rowData) {
                                                                            responseParam._showRow(rowData);
                                                                        })
                                                                    }
                                                                });
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
                                                width: '150%',
                                                buttons:[
                                                    {
                                                        type: 'close', text: '关闭', fn: function () {}
                                                    },{
                                                        type: 'sure', text: '导入', fn: function () {
                                                            var importJson = $('textarea[name=responseJson]').val();
                                                            if(importJson && $.trim(importJson) != ''){
                                                                $.ajax({
                                                                    url: api.util.getUrl('apimanager/params/convertJsonToRows'),
                                                                    type: 'post',
                                                                    data : importJson,
                                                                    contentType : 'application/json;charset=utf-8',
                                                                    dataType: 'json',
                                                                    success: function (result) {
                                                                        var data = result.data;
                                                                        $.each(JSON.parse(data), function (index, rowData) {
                                                                            responseFailParam._showRow(rowData);
                                                                        })
                                                                    }
                                                                });
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
                            }, {
                                title: '接口测试',
                                width: '10%',
                                lazy: true,
                                href: api.util.getUrl('html/action/actionInnerTest.html'),
                                loaded: function () {
                                    $('#depart').parent('.container-fluid').css('display','none');
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
                            }]
                        }
                        var actionTabConfObject = api.ui.tabs(actionTabConf);

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
                            $('#depart').parent('.container-fluid').css('display', '');
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
                                var value = $.trim($(this).val());
                                if(!value){
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
                                        var option={content: '保存失败'};
                                        api.ui.dialog(option).open();
                                        return;
                                    }
                                    $('#depart').parent('.container-fluid').css('display','');
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
