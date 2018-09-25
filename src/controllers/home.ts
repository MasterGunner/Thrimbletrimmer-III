import { Request, Response } from "express";
import * as videoModel from "../models/video"

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
    // res.render("home", {
    //     title: "Home"
    // });

    var indexPage = '';
    videoModel.getVideoList().forEach((video) => {
        indexPage += '<li><a href="/Thrimbletrimmer.html?Video='+video.id+'">'+video.title+'</a></li>'
    });
    indexPage = '<body><h1>Welcome to Thrimbletrimmer!</h1><ul>' + indexPage + '</ul></body>'
    res.type('html');
    res.send(indexPage);
};