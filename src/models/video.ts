export interface Video {
    id: string;
    start: number;
    end: number;
    title: string;
    description: string;
    source?: string;
    // framerate: number;
    // deleteOnSubmit: boolean;
}

var WUBS: Video[] = [
    {id: '2549',
    start: 10,
    end: 591.926213,
    title: 'Desert Bus Clip',
    description: 'A clip from Desert Bus.',
    source: 'videos/DB-TestClip.mp4'}
];

export let getVideoInformation = (id: String):Video => {
    return WUBS[0];
}

export let updateVideoInformation = (video: Video) => {
    console.log(JSON.stringify(video));
}

export let getVideoList = ():Video[] => {
    return WUBS;
}