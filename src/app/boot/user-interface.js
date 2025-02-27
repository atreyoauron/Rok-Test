/// <reference path="../../../phaser.d.ts" />

class UserInterface extends Phaser.Scene {
    constructor() {
        super({
            key: 'userInterface',
            pixelArt: true,
            physics: {
                arcade: {
                    gravity: { y: 700 }
                }
            }
        })

        this.data;
        this.leftButtonPressed = false;
        this.rightButtonPressed = false;
        this.attackButtonPressed = false;
        this.jumpButtonPressed = false;
        this.closeConfigured = false;
    }

    init() {
        this.boot = this.scene.get('boot');
        this.odin = this.boot.odin;
    }

    preload() {

    }

    vikingPedia() {
      var viking = document.getElementById('vikingpedia');
      var close = document.getElementById('closeVikingPedia');

      if(!this.closeConfigured) {
        close.addEventListener('click', () => {
          this.togglePauseGame();
          viking.classList.add('hidden');
          viking.classList.remove('show');
        })
      }

      this.closeConfigured = true;
      const isPaused = this.togglePauseGame();
      const vikingPedia = document.getElementById('vikingpedia');
      if (isPaused) {
        vikingPedia.classList.remove('hidden')
        vikingPedia.classList.add('show')
      } else {
        vikingPedia.classList.add('hidden')
        vikingPedia.classList.remove('show')
      }
    }

    create() {
      buildTopics();
      const tempestade = this.sound.play('Tempestade_de_neve', {
        loop: true
      });

      const musica = this.sound.play('musica', {
        loop: true
      });

      this.pausedScene = null;

      this.input.keyboard.on('keydown_R', function () {
        const activatedScene = this.getActivatedScene(this.scene.manager.scenes);

        this.resetGame(activatedScene);
      }, this);

        this.input.keyboard.on('keydown_P', function () {
          this.togglePauseGame();
        }, this);

        this.input.keyboard.on('keydown_B', function () {
          this.vikingPedia();
        }, this);

        this.cameras.main.flash(500, 0, 0, 0);
        this.input.addPointer(3);
        const lifeBarBox = this.add.graphics();
        const powerBoostBox = this.add.graphics();
        this.lifeBar = this.add.graphics();
        this.powerBoost = this.add.graphics();

        lifeBarBox.clear();
        lifeBarBox.fillStyle(0x000000, 1);
        lifeBarBox.fillRect(10, 10, 100, 10);
        this.updateCharacterLifeBar(0);
        lifeBarBox.setDepth(1);

        powerBoostBox.clear();
        powerBoostBox.fillStyle(0x000000, 1);
        powerBoostBox.fillRect(10, 30, 100, 10);
        this.updateCharacterLifeBar(0);
        powerBoostBox.setDepth(1);

        const leftButton = this.add.sprite(27,330, 'button-sprite', 0);
        const rightButton = this.add.sprite(97,330, 'button-sprite', 1);
        const special = this.add.sprite(500,330, 'button-sprite', 4);
        const attack = this.add.sprite(550,330, 'button-sprite', 3);
        const jump = this.add.sprite(608,330, 'button-sprite', 2);
        const vikingPediaButton = this.add.sprite(600,40, 'vikingpedia_button', 2);

        leftButton.setInteractive();
        rightButton.setInteractive();
        attack.setInteractive();
        jump.setInteractive();
        special.setInteractive();
        vikingPediaButton.setInteractive();

        vikingPediaButton.on('pointerdown', function() {
          this.vikingPedia();
        }, this);

        special.on('pointerdown', function() {
          const odin = this.odin;

          const itens = odin.getData('powerBoost');

          if (itens < 100) {
            return;
          }

          odin.setData('powerBostActive', true);
          odin.startPowerUp();
          this.userPowerBost(true);
          odin.idle();
      }, this);

        leftButton.on('pointerdown', function() {
          this.leftButtonPressed = true;
          this.rightButtonPressed = false;
        }, this);

        rightButton.on('pointerdown', function() {
          this.rightButtonPressed = true;
          this.leftButtonPressed = false;
        }, this);


        rightButton.on('pointerup', function() {
          this.rightButtonPressed = false;
        }, this);

        leftButton.on('pointerup', function() {
          this.leftButtonPressed = false;
        }, this);


        attack.on('pointerdown', function() {
          this.boot.events.emit('fireSpear');
        }, this);
        attack.on('pointerup', function() {
          this.attackButtonPressed = false;
        }, this);

        jump.on('pointerdown', function() {
          const activatedScene = this.getActivatedScene(this.scene.manager.scenes);
          this.boot.events.emit('jump');
        }, this);

        this.events.addListener('damageTaken', function (damage) {
            const takingDamage = this.odin.getData('takingDamage');
            if(!takingDamage) {
              this.updateCharacterLifeBar(damage);
            }
        }, this);

        this.events.addListener('characterDied', function (damage) {
            const activatedScene = this.getActivatedScene(this.scene.manager.scenes);
            activatedScene.scene.stop();
            this.resetGame(activatedScene);
        }, this);
    }

    togglePauseGame() {
      if (this.pausedScene) {
        this.scene.resume('boot');
        this.scene.resume(this.pausedScene);
        this.pausedScene = null;
        return false;
      }

      const activatedScene = this.getActivatedScene(this.scene.manager.scenes);
      this.pausedScene = activatedScene.scene.key;
      this.scene.pause('boot');
      this.scene.pause(activatedScene.scene.key);
      return true;
    }

    resetGame(activatedScene) {
        this.odin.setData('currentLifePoints', 1000);
        this.odin.setData('takingDamage', false);
        const previousData = JSON.parse(localStorage.getItem('currentGameState'));

        activatedScene.scene.start(previousData.fase, {
            odinx: previousData.x,
            odiny: previousData.y
        });
    }

    getCheckpoint(x, y, fase) {
      this.odin.setData('currentLifePoints', 1000);
      this.odin.setData('takingDamage', false);
      localStorage.setItem('currentGameState', JSON.stringify({
        x: x,
        y: y,
        fase: fase,
        odinData: this.odin.data.getAll()
      }))
    }

    getActivatedScene(scenes) {
        const scene = scenes.filter(scene => {
            if (scene.scene.key !== 'boot' && scene.scene.key !== 'userInterface') {
                if (scene.scene.settings.active) {
                    return scene;
                }
            }
        });

        return scene[0];
    }

    getPowerBoost(boost) {
        this.odin.setData('powerBoost');

        if (this.odin.getData('powerBostActive')) {
            this.odin.setData('currentTime', 3000);
        }

        this.powerBoost.clear();
        this.powerBoost.fillStyle(0xffff00, 1);
        this.powerBoost.setDepth(2)
        this.powerBoost.fillRect(10, 30, boost, 10);
    }

    userPowerBost(firstTime) {
        if (firstTime) {
          this.sound.play('Power_up');
          this.odin.setData('currentTime', this.odin.getData('boostTime'));
        }

        this.time.addEvent({
            delay: 100,
            repeat: -1,
            callback: this.reducePowerBar.bind(this)
        });
    }

    reducePowerBar() {
        let currentTime = this.odin.getData('currentTime');
        let boostTime = this.odin.getData('boostTime');
        let powerBostActive = this.odin.getData('powerBostActive');

        let segundosRestantes = currentTime * 100 / boostTime;

        this.odin.setData('powerBoost', segundosRestantes);

        this.powerBoost.clear();
        this.powerBoost.fillStyle(0xffff00, 1);
        this.powerBoost.setDepth(2)
        this.powerBoost.fillRect(10, 30, segundosRestantes, 10);

        this.odin.setData('currentTime', currentTime - 100);

        if (this.odin.getData('currentTime') <= 0 && powerBostActive) {
            this.time.removeAllEvents();
            this.time.clearPendingEvents();
            this.odin.setData('powerBostActive', false);
            this.odin.finishPowerUp();
            this.powerBoost.clear();
            this.powerBoost.fillStyle(0xffff00, 1);
            this.powerBoost.setDepth(2)
            this.powerBoost.fillRect(10, 30, 0, 10);
        }
    }

    updateCharacterLifeBar(damage) {
        if (this.odin.getData('currentLifePoints') < 1) {
            return;
        }

        let updatedLifePoints = this.odin.getData('currentLifePoints') - damage;
        let porcentagem;
        this.odin.setData('currentLifePoints', updatedLifePoints);
        porcentagem = (this.odin.getData('currentLifePoints') * 100) / this.odin.getData('totalLifePoints');

        if (porcentagem <= 0) {
            this.events.emit('characterDied');
            this.lifeBar.clear();
            this.lifeBar.fillStyle(0xff0000, 1);
            this.lifeBar.setDepth(2)
            this.lifeBar.fillRect(10, 10, 0, 10);
            return;
        }

        this.lifeBar.clear();
        this.lifeBar.fillStyle(0xff0000, 1);
        this.lifeBar.setDepth(2)
        this.lifeBar.fillRect(10, 10, porcentagem, 10);
    }
}

export default UserInterface;
