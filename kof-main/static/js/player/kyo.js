import { Player } from '/static/js/player/player.js'
import { GIF } from '/static/js/utils/gif.js'

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);
        this.init_animation();

    } aw

    init_animation() {
        let outer = this;
        let offsets = [0, -22, -22, -40, 0, 0, 0];
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`)
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0, // 当前动画的总帧数
                frame_rate: 10,// 多少帧执行下一个页面，也就是帧的速度
                offset_y: offsets[i], // y方向偏移量
                loaded: false, //  是否加载完成
                scale: 2,   // 放大多少倍
            })

            gif.onload = function () {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;
                if (i === 5) {
                    obj.frame_rate = 12;
                }
                if (i === 3) {
                    obj.frame_rate = 12;
                }
            }
        }
    }

}