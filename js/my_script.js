// 获取配置文件
fetch('config.json')
    .then((response) => {
        return response.json();
    })
    .then((result) => {
        $("#loading").hide();
        init_search_area(result);
        init_site_area(result);
    });
// 初始化 搜索区域
function init_search_area(config) {
    for (let i = 0; i < config['searches'].length; i++) {
        let search_html =
            `
                <div class="ui text container center aligned" style="margin-top: 16px">
                    <div class="ui icon input" style="width: 64%;margin-right: 0;padding-right: 0">
                        <input id="input_${config['searches'][i]['id']}" ${i === 0 ? 'autofocus="autofocus"' : ''} type="text" placeholder="">
                        <i id="icon_${config['searches'][i]['id']}" class="close link icon"></i>
                    </div>
                    <button id="button_${config['searches'][i]['id']}" class="large ui blue button">${config['searches'][i]['name']}</button>
                </div>
            `;
        $("#search_area").append(search_html);
        // 绑定Button点击事件
        $(`#button_${config['searches'][i]['id']}`).click(() => {
            window.open(config['searches'][i]['url'] + encodeURIComponent($(`#input_${config['searches'][i]['id']}`).val()));
        });
        // 清除按钮
        $(`#icon_${config['searches'][i]['id']}`).click(function () {
            $('input').val('');
            $(this).siblings('input').focus();
        });
    }
    // 搜索框内容同步
    $('input').bind("input propertychange", (e) => {
        for (let i = 0; i < config['searches'].length; i++) {
            if ($(e.target).attr('id') !== `input_${config['searches'][i]['id']}`) {
                $(`#input_${config['searches'][i]['id']}`).val($(e.target).val());
            }
        }
    });
    // 绑定 Enter
    $('input').keypress((e) => {
        if (e.which === 13) {
            for (let i = 0; i < config['searches'].length; i++) {
                if ($(e.target).attr('id') === `input_${config['searches'][i]['id']}`) {
                    window.open(config['searches'][i]['url'] + encodeURIComponent($(`#input_${config['searches'][i]['id']}`).val()));
                }
            }
        }
    });
}

// 初始化网址区域
function init_site_area(config) {
    for (let i = 0; i < config['sites'].length; i++) {
        // 添加网址类别
        let site_type =
            `
            <div class="column">
                <div class="ui segment">
                    <div class="ui blue top attached label"><div class="ui center aligned container">${config['sites'][i]['type']}</div></div>
                    <div id="list_${config['sites'][i]['id']}" class="ui relaxed middle aligned list"></div>
                </div>
            </div>
            `;
        $("#site_area").append(site_type);
        // 添加网址
        for (let j = 0; j < config['sites'][i]['contents'].length; j++) {
            let site_html =
                `
                <a class="item" href="${config['sites'][i]['contents'][j]['url']}" target="_blank" data-position="top center" data-content="${config['sites'][i]['contents'][j]['description']}">
                    <img class="ui image" width="32" height="32" src="${config['sites'][i]['contents'][j]['icon']}"/>
                    <div class="ui content" style="width: 98px;padding-left: 0">${config['sites'][i]['contents'][j]['name']}</div>
                </a>
                `;
            $(`#list_${config['sites'][i]['id']}`).append(site_html);
        }
    }
    $('.item').popup();
}