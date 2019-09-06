$('#loginBtn').on('click', function () {
    var account = $('[name=account]').val(), password = $('[name=password]').val(), params = {};
    if(!account) {
        $('#msg').text('账号不能为空！');
        return;
    }
    if(!password){
        $('#msg').text('密码不能为空！');
        return;
    }
    params['account'] = account;
    params['password'] = password;
    $.ajax({
        url: api.util.getUrl('apimanager/user/login'),
        type: 'GET',
        data: params,
        dataType: 'json',
        success: function (result) {
            var code = result.code, msg = result.msg;
            if(code == '-1'){
                $('#msg').text(msg);
            } else {
                window.location.href = 'index.html';
            }
        }
    });
});
//跳转到注册页面
$('#registerLoginBtn').on('click',function () {
    window.location.href = 'regist.html';
})
// 监听回车事件，并且屏蔽回车后浏览器刷新
$(document).keydown(function (event) {
    if(event.keyCode == 13){
        $('#loginBtn').click();
        return false;
    }
});

//能获取到[id=container]节点，说明login.html被嵌套在index.html页面了，这是登录失效重定向的结果
if($('#container').length){
    window.open('/login.html', '_self');
}