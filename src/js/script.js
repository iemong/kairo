import { BASE_DIR } from '../constants.yml'

const matter = matter || {};
const canvas__width = document.documentElement.clientWidth;
const canvas__height = document.documentElement.clientHeight;

matter.module = function () {
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Composites = Matter.Composites;
    const Common = Matter.Common;
    const World = Matter.World;
    const Bodies = Matter.Bodies;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
        element: canvas__wrap, //キャンバスが挿入される要素への参照
        canvas: canvas__wrap__physics,
        engine: engine, //使用するMatter.Engineインスタンスへの参照
        options: {
            width: Math.min(canvas__width), //作成されるcanvasの幅。デフォルト： 600
            height: Math.min(canvas__height), //作成されるcanvasの高さ。デフォルト： 800
            pixelRatio: 1, //ピクセル比率
            background: 'transparent', //背景
            hasBounds: false, //レンダリング時にrender.boundsを使用するかどうかを指定するフラグ。
            enabled: true,
            wireframes: false
        }
    });

    Render.run(render);

    const runner = Runner.create(); //新しいランナーを作成します。
    Runner.run(runner, engine);

    //(xx, yy,columns, rows, columnGap(隙間), rowGap（隙間）, callback)
    const circle_stack = Composites.stack(10, 10, 40, 5, 0, 0, function (x, y) {
        return Bodies.circle(x, y, Common.random(3, 6), {
            isStatic: false,
            frictionAir: 0.01, //空気抵抗
            restitution: 0.3, //弾力性
            render: {
                fillStyle: 'black',
                strokeStyle: '#ccc',
                lineWidth: 1
            }
        });
    });
    World.add(world, circle_stack);

    World.add(world, [
        Bodies.rectangle(canvas__width / 2, -25, canvas__width, 50, {
            isStatic: true
        }),
        Bodies.rectangle(canvas__width / 2, canvas__height + 25, canvas__width, 50, {
            isStatic: true
        }),
        Bodies.rectangle(canvas__width + 25, canvas__height / 2, 50, canvas__height, {
            isStatic: true
        }),
        Bodies.rectangle(-25, canvas__height / 2, 50, canvas__height, {
            isStatic: true
        })
    ]);

    window.addEventListener("devicemotion", devicemotionHandler, true);
    const deviceOrientation = window.orientation;
    function devicemotionHandler(event) {
        const x = event.acceleration.x;
        const y = event.acceleration.y;
        const z = event.acceleration.z;
        document.getElementById("acceleration__detection__x").innerHTML = "x軸の加速度" + x;
        document.getElementById("acceleration__detection__y").innerHTML = "y軸の加速度" + y;
        document.getElementById("acceleration__detection__z").innerHTML = "z軸の加速度" + z;

        if(Math.abs(x) > 5) {
            const circle_stack = Composites.stack(10, 10, 40, 5, 0, 0, function (x, y) {
                return Bodies.circle(x, y, Common.random(3, 6), {
                    isStatic: false,
                    frictionAir: 0.01, //空気抵抗
                    restitution: 0.3, //弾力性
                    render: {
                        fillStyle: 'black',
                        strokeStyle: '#ccc',
                        lineWidth: 1
                    }
                });
            });
            World.add(world, circle_stack);
        }
        const gravity = engine.world.gravity;

        //重力加速度 (物体の重力を調節)
        var xg = event.accelerationIncludingGravity.x / 10;
        var yg = event.accelerationIncludingGravity.y / 10;

        // 傾きに応じて重力を調節
        switch (deviceOrientation) {
            case 0:
                gravity.x = xg + event.acceleration.x;
                gravity.y = -1 * yg + event.acceleration.y;
                break;
            case 90:
                gravity.x = -1 * yg - event.acceleration.x;
                gravity.y = -1 * xg + event.acceleration.x;
                break;
            case -90:
                gravity.x = yg + event.acceleration.x;
                gravity.y = xg - event.acceleration.x;
                break;
            case 180:
                gravity.x = -1 * xg - event.acceleration.x;
                gravity.y = yg - event.acceleration.x;
            default:
                break;
        }

        // androidとiOSは加速度が真逆なのでその対応
        if (navigator.userAgent.indexOf('Android') > 0) {
            gravity.x = -1 * gravity.x;
            gravity.y = -1 * gravity.y;
        }
    }

    Render.lookAt(render, {
        min: {
            x: 0,
            y: 0
        },
        max: {
            x: canvas__width,
            y: canvas__height
        }
    });

    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: canvas__wrap__physics,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
            window.addEventListener("deviceorientation", deviceorientationHandler);
        }
    }
}

matter.module();

