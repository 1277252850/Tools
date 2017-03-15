# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

import requests
from time import sleep
from bs4 import BeautifulSoup


def get_response(method, url, data=None, headers=None):
    for i in xrange(5):
        try:
            if method.lower() is 'post':
                return requests.request(method=method, url=url, data=data, headers=headers)
            else:
                return requests.request(method=method, url=url, params=data, headers=headers)
        except:
            print '请求网页出错，正在重试...'


def download_file(url, filename):
    print '开始下载：' + url
    for i in xrange(5):
        try:
            r = requests.get(url, stream=True)
            with open(filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=1024):
                    f.write(chunk)
            print '下载完成.'
            sleep(1)
            return True
        except:
            print '下载文件出错，正在重试...'
            sleep(1)


def download_pdf_with_peekier(response):
    content = response.json()
    if content['success']:
        results = content['results']
        for result in results:
            url = result['url']
            title = result['title']
            # 如果url类型为pdf，则下载第一个url
            if url.split('.').pop() == 'pdf':
                download_file(url, title + '.pdf')


def get_titles(file):
    # 获取题目
    with open(file, 'r') as f:
        title = f.readline()
        titles = []
        while title:
            titles.append(title.strip())
            title = f.readline()
        return titles


def do_download_with_peekier(title):
    url = 'https://search.peekier.com/search'
    headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-encoding': 'gzip, deflate',
        'accept-language': 'zh-CN,zh;q=0.8',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://peekier.com',
        'referer': 'https://peekier.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
    }
    data = {'opts': '{"page":0,"region":"CN","safe":0,"age":0}', 'prefetch': '6', 'q': title}
    if not download_pdf_with_peekier(get_response('post', url, data=data, headers=headers)):
        return False
    sleep(1)
    return True


def do_download_with_baidu(title):
    url = 'http://xueshu.baidu.com/s'
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Host': 'xueshu.baidu.com',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'http://xueshu.baidu.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
    }
    data = {
        'wd': title,
        'rsv_bp': '0',
        'tn': 'SE_baiduxueshu_c1gjeupa',
        'rsv_spt': '3',
        'ie': 'utf-8',
        'f': '8',
        'rsv_sug2': '1',
        'sc_f_para': 'sc_tasktype={firstSimpleSearch}'
    }
    if not download_pdf_with_baidu(get_response('get', url, data=data, headers=headers)):
        return do_download_with_peekier(title)
    sleep(1)
    return True


def download_pdf_with_baidu(response):
    soup = BeautifulSoup(response.text, 'html.parser')
    title = soup.title.string
    if '_' in title:
        title = title.split('_').pop(0)
    div = soup.find('div', 'allversion_content')
    if div is None:
        # 百度学术列表界面
        div = soup.find('div', 'sc_content')
        if title in div.a.text:
            link = 'http://xueshu.baidu.com' + div.a['href']
            # 进入列表中的第一项，并下载
            return download_pdf_with_baidu(get_response('get', link))
    else:
        # 百度学术详情界面
        span_list = div.find_all('span', 'dl_lib')
        for span in span_list:
            if '全网免费下载' in span.string:
                # 找到对应的a标签
                link = span.parent.a['href']
                file_type = link.split('.').pop()
                if file_type == 'pdf' or (file_type != 'pdf' and file_type != 'html' and file_type != 'php'):
                    if download_file(link, title + '.pdf'):
                        # 下载成功，返回
                        return True


if __name__ == '__main__':
    for title in get_titles('titles.txt'):
        if not do_download_with_baidu(title):
            print '下载《' + title + '》失败'

