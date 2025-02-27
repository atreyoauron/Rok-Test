/// <reference path="../../../phaser.d.ts" />
import HidromelSpawner from '../prefabs/hidromel-spawner.js';
import BarrelSpawner from '../prefabs/barrel-spawner.js';
import CrowSpawner from '../prefabs/crow-spawner.js';
import CheckPoint from '../prefabs/checkpoint.js';

class FaseNove extends Phaser.Scene {
    constructor() {
        super({
            key: 'fasenove',
            pixelArt: true,
            physics: {
                arcade: {
                    gravity: { y: 700 },
                    debug: false
                }
            }
        })

        this.odin;
        this.common;
    }

    init(config) {
        this.common = this.scene.get('boot');
        this.odin = this.common.odin;
        this.scene.stop('fasesete');
        this.odin.resetSpearGroup();
        this.ui = this.scene.get('userInterface');
        if (config) {
            this.odin.x = config.odinx;
            this.odin.y = config.odiny;
            this.physics.world.enable(this.odin);
        }
    }

    preload() {

    }

    create() {
        this.cameras.main.setBackgroundColor('rgba(10, 230, 255, 1)');

        var map = this.add.tilemap('fase_9');

        var tileset = map.addTilesetImage('plataformas');
        this.ground = map.createStaticLayer('plataformas', tileset);
        this.ground.setCollisionByProperty({ collider: true });
        const bg = this.add.sprite(0,0,'fase9-sprite', 0);
        bg.anims.play('fase9');
        bg.setOrigin(0);

        this.physics.add.collider(this.odin, [this.ground], function() {
            this.odin.resetJump();
        }, null, this);

        this.odin = this.add.existing(this.odin);

        const checkpoint = new CheckPoint({
          scene: this,
          x: 621,
          y: 52,
          key: 'checkpoint'
        });

        this.physics.add.overlap(this.odin, checkpoint, (over1, over2) => {
          checkpoint.getCheckpoint(this.ui, 621, 52, 'fasenove');
        }, null, this);


        const barrelOne = new BarrelSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'barril',
                maxSize: 2,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 0,
                y: 330,
                speedDirection: 120,
                colliders: [this.ground],
                overlaps: [this.odin],
            }
        });

        const barrelTwo = new BarrelSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'barril',
                maxSize: 2,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 20,
                y: 330,
                speedDirection: 120,
                colliders: [this.ground],
                overlaps: [this.odin],
            }
        });

        this.crows = new CrowSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'crow',
                maxSize: 15,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 400,
                y: 300,
                bounce: {
                    x: 1,
                    y: 1
                },
                speedDirection: {
                    x: 0,
                    y: -120
                },
                colliders: [this.ground],
                overlap: this.odin,
            }
        });

        this.crows.createCrow({x: 255, y: 30},{ x: 0, y: 50});
        this.crows.createCrow({x: 255, y: 60},{ x: 0, y: 50});
        this.crows.createCrow({x: 255, y: 90},{ x: 0, y: 50});
        this.crows.createCrow({x: 255, y: 115},{ x: 0, y: 50});

        this.crows.createCrow({x: 309, y: 142},{ x: -50, y: 0});

        const hidromel = new HidromelSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'hidromel',
                maxSize: 1,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 585,
                y: 146,
                colliders: [this.ground],
                overlaps: [this.odin],
            }
        });
        hidromel.createSpawner();

        const hidromel2 = new HidromelSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'hidromel',
                maxSize: 1,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 250,
                y: 48,
                colliders: [this.ground],
                overlaps: [this.odin],
            }
        });
        hidromel2.createSpawner();

        if (!checkIfExists('Hidromel')) {
          const hidromelPedia = this.physics.add.staticImage(482, 40, 'vikingpedia');
          hidromelPedia.setDataEnabled();
          hidromelPedia.setData('jaPegou', false);

          this.physics.add.overlap(hidromelPedia, this.odin, function() {
            if (!hidromelPedia.getData('jaPegou')) {
              this.sound.play('Pegar_item');
              setNewTopic('Hidromel');
              hidromelPedia.setData('jaPegou', true);
              hidromelPedia.setVisible(false);
            }
          }, null, this);
        }

        barrelOne.createBarrelSpawner();
        barrelTwo.createBarrelSpawner();
    }

    update() {
        this.odin.checkCursorMoviment(this.common);

        if (this.odin.x >= 137 && this.odin.x <= 244 && this.odin.y < 0
            || this.odin.x >= 568 && this.odin.x <= 628 && this.odin.y < 0) {
            this.scene.start('faseoito', {
                odinx: this.odin.x,
                odiny: 360
            });
        }


        if(this.odin.x > 630) {
            this.scene.start('fasedez', {
                odinx: 0,
                odiny: 36,
            });
        }
    }
}

export default FaseNove;
