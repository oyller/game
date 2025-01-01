import { AcGameObject } from '/static/js/my_game_object/base.js'


var e;

export class Player extends AcGameObject {
    //
    constructor(root, info) {
        e = root;
        super();
        this.root = root;
        this.id = info.id;  //  任务id
        this.x = info.x; //  位置
        this.y = info.y;
        this.width = info.width; // 宽高
        this.height = info.height;
        this.color = info.color;
        this.vx = 0; // 速度
        this.vy = 0;
        this.speedx = 400; // 水平速度 
        this.speedy = -2330; // 跳起来的初始速度
        this.direction = 1;   //  正方向
        this.ctx = this.root.game_map.ctx;
        this.gravity = 50;
        this.status = 3; // 0: 原地不动, 1:向前走 2:向后 3：跳跃 4：攻击 5: 被打 6：死亡
        this.pressed_keys = this.root.game_map.controller.pressed_keys;
        this.animations = new Map()
        this.frame_current_cnt = 0;
        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        this.key = "*";
    }

    start() {


    }

    update_direction() {
        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.status === 6) {
                return;
            }
            if (me.x < you.x) {
                me.direction = 1;
            }
            else
                me.direction = -1;
        }

    }



    update_move() {
        if (this.status === 1) {
            let players = this.root.players;
            let me = this, you = players[1 - this.id];
            // console.log("前进");
            // console.log(this.status);
            // console.log("死亡");
            // console.log(you.status);
            // if (this.key === 'd' && this.status === 1 && you.status === 6 && this.x >= you.x - you.height && this.x <= you.x) {
            //     return;
            // }
            if (this.key === 'd' && this.direction === 1 && this.x + me.width >= you.x)
                return;
            if (this.key === 'a' && this.direction === -1 && you.x + you.width >= me.x)
                return;
        }
        if (this.status === 3 || this.status === 5) {
            this.vy += this.gravity;
        }
        this.x += (this.vx * this.timedelta / 1000);
        this.y += (this.vy * this.timedelta / 1000);
        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            this.status = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        else if (this.x + this.width > this.ctx.canvas.width) {
            this.x = this.ctx.canvas.width - this.width;
        }
    }

    update_control() {
        let w, a, d, space;
        if (this.id == 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        }
        else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }
        if (this.status === 0 || this.status === 1) { // 该状态为处于0 或者 1 的状态  表示任务处于向前走或者向后走， 或者原地不动
            if (space) {
                this.status = 4;  //   发起攻击的话， 只会执行此代码块一次
                this.vx = 0;
                this.frame_current_cnt = 0;
                this.key = ' ';
            }
            else
                if (w) {
                    if (d) {
                        this.vx = this.speedx;
                    } else if (a) {
                        this.vx = -this.speedx;
                    }
                    else
                        this.vx = 0
                    this.vy = this.speedy;
                    this.status = 3;
                    this.frame_current_cnt = 0
                    this.key = 'w';
                }
                else if (d) {

                    this.vx = this.speedx;
                    this.status = 1;
                    this.key = 'd';
                }
                else if (a) {
                    this.vx = -this.speedx;
                    this.status = 1;
                    this.key = 'a';
                }
                else {
                    this.vx = 0;
                    this.status = 0;
                    this.key = '*';
                }
        }

    }

    is_attack() {
        if (this.status === 6)
            return;
        this.status = 5;
        this.frame_current_cnt = 0;
        this.hp = Math.max(this.hp - 20, 0)

        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 'slow')


        if (this.hp <= 0) {
            this.status = 6;

            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }
        return true;
    }


    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 32) {

            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                }
            }
            else {
                r1 = {
                    x1: me.x - 100,
                    y1: me.y + 40,
                    x2: me.x,
                    y2: me.y + 40 + 20,
                }

            }
            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height
            }
            this.status = 0;
            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }


    update() {
        this.update_control();
        this.update_move()
        this.update_direction()
        this.update_attack();
        this.render()
    }

    render()  //  渲染
    {

        let status = this.status;
        if (this.status === 1 && this.direction * this.vx < 0) {
            status = 2;
        }
        let obj = this.animations.get(status);
        if (obj && obj.loaded) {
            if (this.direction > 0) {
                let m = parseInt(this.frame_current_cnt / obj.frame_rate)

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            }
            else {
                this.ctx.save();
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
                this.ctx.restore();
            }
        }

        if ((status === 4 || status === 5 || status == 6) && this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
            if (status === 6) {
                this.frame_current_cnt--;
            }
            else
                this.status = 0;
        }

        this.frame_current_cnt++;
    }


}