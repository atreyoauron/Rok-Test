/// <reference path="../../../phaser.d.ts" />
import BarrelSpawner from '../prefabs/barrel-spawner.js';
import CrowSpawner from '../prefabs/crow-spawner.js';
import HidromelSpawner from '../prefabs/hidromel-spawner.js';

class FaseOito extends Phaser.Scene {
    constructor() {
        super({
            key: 'faseoito',
            pixelArt: true,
            physics: {
                arcade: {
                    gravity: { y: 700 },
                    debug: false,
                    // tileBias: 120,
                }
            }
        })

        this.odin;
        this.common;
    }

    init(config) {
        this.common = this.scene.get('boot');
        this.odin = this.common.odin;
        this.scene.stop('faseseis');
        this.odin.resetSpearGroup();

        if (config) {
            this.odin.x = config.odinx;
            this.odin.y = config.odiny;
            this.odin.body.setVelocityX(0);
            this.physics.world.enable(this.odin);
        }
    }

    preload() {

    }

    create() {
        this.cameras.main.setBackgroundColor('rgba(10, 230, 255, 1)');
        var map = this.add.tilemap('fase_8');
        var tileset = map.addTilesetImage('plataformas');
        this.ground = map.createDynamicLayer('plataformas', tileset);
        this.ground.setCollisionByProperty({ collider: true });

        const helbg = this.add.sprite(0,0,'hel-bg', 0);
        helbg.anims.play('hel');
        helbg.setOrigin(0,0);

        this.odin = this.add.existing(this.odin);
        this.breakableWall = this.physics.add.staticGroup([
          this.physics.add.staticSprite(556, 14, 'breakable-wall'),
          this.physics.add.staticSprite(556, 30, 'breakable-wall'),
          this.physics.add.staticSprite(556, 46, 'breakable-wall'),
          this.physics.add.staticSprite(556, 62, 'breakable-wall'),
          this.physics.add.staticSprite(556, 78, 'breakable-wall'),
          this.physics.add.staticSprite(556, 94, 'breakable-wall'),
          this.physics.add.staticSprite(556, 110, 'breakable-wall'),
          this.physics.add.staticSprite(556, 126, 'breakable-wall')
        ]);

        this.physics.add.collider(this.odin, [this.ground, this.breakableWall], function() {
          this.odin.resetJump();
        }, null, this);

        const hidromel = new HidromelSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'hidromel',
                maxSize: 1,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 155,
                y: 20,
                colliders: [this.ground],

                overlaps: [this.odin],
            }
        });
        hidromel.createSpawner();

        const barrels = {
          barrelList: [
            {
              groupMultipleConfig: {},
              customConfig: {
                  x: 333,
                  y: 95,
                  speedDirection: -68,
              }
            },
            {
              groupMultipleConfig: {},
              customConfig: {
                  x: 370,
                  y: 109,
                  speedDirection: -68,
              }
            },
            {
              groupMultipleConfig: {},
              customConfig: {
                  x: 400,
                  y: 120,
                  speedDirection: -68,
              }
            },
            {
              groupMultipleConfig: {},
              customConfig: {
                  x: 440,
                  y: 132,
                  speedDirection: -68,
              }
            },
            {
              groupMultipleConfig: {},
              customConfig: {
                  x: 480,
                  y: 145,
                  speedDirection: -68,
              }
            },
          ],
          groupConfig: {
            defaultKey: 'barril',
            maxSize: 5,
          },
          groupMultipleConfig: {},
          customConfig: {
          },
          scene: this,
          colliders: [this.ground],
          overlaps: [this.odin],
          minToSpawn: 5,
        };

        const firstWave = new BarrelSpawner({
          scene: this,
          groupConfig: {
              defaultKey: 'barril',
              maxSize: 3,
          },
          groupMultipleConfig: {},
          customConfig: {
              x: 354,
              y: 0,
              timing: 0,
              speedDirection: -120,
              colliders: [this.ground],
              overlaps: [this.odin],
          }
        });

        firstWave.createMultipleSpawner(barrels);

        this.crows = new CrowSpawner({
            scene: this,
            groupConfig: {
                defaultKey: 'crow',
                maxSize: 1,
            },
            groupMultipleConfig: {},
            customConfig: {
                x: 489,
                y: 300,
                bounce: {
                    x: 0,
                    y: 1
                },
                speedDirection: {
                    x: 0,
                    y: -30
                },
                colliders: [this.ground, this.breakableWall],
                overlap: this.odin,
            }
        });

        this.crows.createCrow({x: 273, y: 21},{ x: 0, y: 50});


        this.barrelSwitch = this.physics.add.staticImage(602, 33, 'alvo');
        this.barrelSwitch.setDataEnabled();
        this.barrelSwitch.setName('switchBarrelOff');

        this.barrelSwitch.setData('barrels', [firstWave]);

        if (!checkIfExists('Hel (Entidade)')) {
          const helEntidadePedia = this.physics.add.staticImage(404, 44, 'vikingpedia');
          helEntidadePedia.setDataEnabled();
          helEntidadePedia.setData('jaPegou', false);

          this.physics.add.overlap(helEntidadePedia, this.odin, function() {
            if (!helEntidadePedia.getData('jaPegou')) {
              this.sound.play('Pegar_item');
              setNewTopic('Hel (Entidade)');
              helEntidadePedia.setData('jaPegou', true);
              helEntidadePedia.setVisible(false);
            }
          }, null, this);
        }

        if (!checkIfExists('Hel (Reino)')) {
          const helReinoPedia = this.physics.add.staticImage(191, 238, 'vikingpedia');
          helReinoPedia.setDataEnabled();
          helReinoPedia.setData('jaPegou', false);

          this.physics.add.overlap(helReinoPedia, this.odin, function() {
            if (!helReinoPedia.getData('jaPegou')) {
              this.sound.play('Pegar_item');
              setNewTopic('Hel (Reino)');
              helReinoPedia.setData('jaPegou', true);
              helReinoPedia.setVisible(false);
            }
          }, null, this);
        }
    }

    update() {
        this.odin.checkCursorMoviment(this.common);

        if (
            this.odin.x >= 10 && this.odin.x <= 120 && this.odin.y > 360
            || this.odin.x >= 136 && this.odin.x <= 237 && this.odin.y > 360
            || this.odin.x >= 136 && this.odin.x <= 629 && this.odin.y > 360) {
                this.scene.start('fasenove', {
                odinx: this.odin.x,
                odiny: 0,
            });
        }
    }
}

export default FaseOito;
