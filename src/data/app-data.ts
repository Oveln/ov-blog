import { Url } from "next/dist/shared/lib/router/router";

export class AppData {
    public readonly APP_NAME: string;
    public readonly APP_DESCRIPTION?: string;
    public readonly APP_URL: Url;
    constructor(app_name: string, app_description: string, app_url: Url) {
        this.APP_NAME = app_name;
        this.APP_DESCRIPTION = app_description;
        this.APP_URL = app_url;
    }
}

export const appsData = [
    new AppData("Excalidraw", "一个在线画图工具", "https://excalidraw.oveln.icu"),
    new AppData("Oveln Note", "Oveln的学习笔记，基于Obisidan", "https://note.oveln.icu"),
    new AppData("Oveln Pan", "Oveln自用的网盘", "https://pan.oveln.icu:5080/"),
    new AppData("Oveln Music", "Oveln自用的音乐播放器", "https://music.oveln.icu:5080/"),
    new AppData("Suger OJ", "Oveln搭建的在线评测平台", "https://oj.oveln.icu:5080")
];
