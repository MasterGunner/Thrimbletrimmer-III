import { Request, Response } from "express";
import * as videoModel from "../models/video"

/**
 * GET /getVideo
 * Get Video Details
 */
export let getVideo = (req: Request, res: Response) => {
    console.log(req.params.a);
    res.json(JSON.stringify(videoModel.getVideoInformation(req.params.a)));
}

/**
 * POST /submitVideo
 * Submit Video Details
 */
export let submitVideo = (req: Request, res: Response) => {
    console.log("Recieved Edit Request");
    let validation = validateVideoSubmission(req.body);
    if(validation[0]) {
        //really should handle this with promises
        videoModel.updateVideoInformation(req.body);
        res.send('Received Video Edits');
    } else {
        res.status(400).send(validation[1]);
    }
};

//Video Input Validation
function validateVideoSubmission (data: videoModel.Video): Array<any> { 
    var validation = [false, "Unkown Error"];
    if(data.id && data.start && data.end && data.title && data.description) {
        if(parseFloat(data.start.toString()) < parseFloat(data.end.toString())) {
            if (data.title.length <= 91) {
                return [true];
            } else { validation = [false, "Failed Validation: Title longer than 91 characters"]; } 
        } else { validation = [false, "Failed Validation: Start greater than End."]; } 
    } else { validation = [false, "Failed Validation: Missing parameter. Require Video ID, Start, End, Title, and Description."]; } 
    
    console.log(validation[1].toString());
    console.log(JSON.stringify(data));
    return validation;
}