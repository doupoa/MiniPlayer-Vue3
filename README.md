# MiniPlayer-Vue3
<center>🎵一个简约在线音乐播放器🎵</center>

## 介绍

本项目为**MiniPlayer**的前端项目，后端项目请前往[MiniPlayer-Server](https://github.com/doupoa/MiniPlayer-Server)查看

**MiniPlayer**项目前端使用Vue3进行开发，前端页面基于由[muhammed](https://github.com/muhammed/mini-player/commits?author=muhammed)所开发的项目[mini-player](https://github.com/muhammed/mini-player) 进行二次开发。

## 功能介绍
本项目开发理念在于能给用户提供在任何能访问网页的设备上听自己喜欢的歌曲，例如前往机房上课、出差旅游等不想安装或不能安装自己常用的音乐软件。因此本项目针对以上需求在[mini-player](https://github.com/muhammed/mini-player) 的基础上增加了以下功能：

 - 用户登录注册
 - 歌单歌曲管理
 - 可加载lrc歌词
 - 更换字体图标为AwesomeFont

## 快速开始

1. 安装Vue3后，将项目下载到本地，执行`yarn init`初始化项目所需模块(`npm init`也行，但可能会产生意料之外的错误。如果您未曾使用过yarn,她也只是npm中众多的模块之一，相信我，您会爱上它的=)  )

2. 进入项目-src-main.js,修改`13`，`14`行的配置项，13行为后端地址，14行为登录数据安全传输所用的RSA加密公钥。对应的私钥请在**MiniPlayer-Server**中填写。

3. 随后在项目目录下使用`npm build`对项目进行编译即可。编译后的文件请在`dist`目录下查看。