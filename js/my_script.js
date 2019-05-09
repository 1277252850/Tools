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
        let search_html = `
                        <div class="page-content">
                            <div class="mdl-textfield mdl-js-textfield">
                                <input class="mdl-textfield__input" type="text" id="input_${config['searches'][i]['id']}" ${i === 0 ? 'autofocus="autofocus"' : ''}>
                                <label class="mdl-textfield__label" for="input_${config['searches'][i]['id']}"></label>
                            </div>
                            <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" id="button_${config['searches'][i]['id']}">
                                ${config['searches'][i]['name']}
                            </button>
                        </div>`;
        $("#search_area").append(search_html);
        // 绑定Button点击事件
        $(`#button_${config['searches'][i]['id']}`).click(() => {
            window.open(config['searches'][i]['url'] + encodeURIComponent($(`#input_${config['searches'][i]['id']}`).val()));
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
        let site_type = `
                        <div class="mdl-cell mdl-cell--2-col mdl-shadow--2dp my_top_padding">
                            <span>${config['sites'][i]['type']}</span>
                            <ul class="demo-list-icon mdl-list" id="ul_${config['sites'][i]['id']}"></ul>
                        </div>`;
        $("#site_area").append(site_type);
        // 添加网址
        for (let j = 0; j < config['sites'][i]['contents'].length; j++) {
            let site_html = `
                    <li class="mdl-list__item">
                        <a id="a_${config['sites'][i]['contents'][j]['id']}" class="mdl-list__item-primary-content my_center" href="${config['sites'][i]['contents'][j]['url']}" target="_blank">
                            <img class="material-icons my_icon" src="${config['sites'][i]['contents'][j]['icon']}" alt="">
                            <span class="my_span">${config['sites'][i]['contents'][j]['name']}</span>
                        </a>
                        <div class="mdl-tooltip mdl-tooltip--large mdl-tooltip--top" data-mdl-for="a_${config['sites'][i]['contents'][j]['id']}">${config['sites'][i]['contents'][j]['description']}</div>
                    </li>
                `;
            $(`#ul_${config['sites'][i]['id']}`).append(site_html);
        }
    }
}