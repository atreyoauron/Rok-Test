/// <reference path="../../../phaser.d.ts" />

class BarrelSpawner extends Phaser.GameObjects.Group {
  constructor(config) {
    super(config.scene, config.groupConfig, config.customConfig);
    this.config = config;
    this.userInterface = this.scene.scene.get('userInterface');

  }

  destroySpawner() {
    this.barrelGroup.clear(true, true);
    this.barrelTimer.remove();
  }

  createMultipleSpawner(barrels) {
    this.barrelGroup = this.scene.physics.add.group();
    this.barrelGroup.maxSize = barrels.groupConfig.maxSize;

    this.queueBarrel(this.config.customConfig.timing, this.createMultipleBarrels, {
      barrelGroup: this.barrelGroup,
      barrelList: barrels.barrelList,
      minToSpawn: barrels.minToSpawn,
      colliderList: barrels.colliders,
      overlapList: barrels.overlaps,
      groupConfig: barrels.groupConfig
    });
  }

  createBarrelSpawner() {
    this.barrelGroup = this.scene.physics.add.group();
    this.barrelGroup.maxSize = this.config.groupConfig.maxSize;

    this.queueBarrel(this.config.customConfig.timing, this.createNewBarrel, {
      speedDirection: this.config.customConfig.speedDirection,
      barrelX: this.config.customConfig.x,
      barrelY: this.config.customConfig.y,
      barrelGroup: this.barrelGroup,
      colliderList: this.config.customConfig.colliders,
      overlapList: this.config.customConfig.overlaps
    });
  }

  createMultipleBarrels(config) {
    const used = this.barrelGroup.getTotalUsed();

    if (used !== 0 && used !== config.minToSpawn) {
      return;
    }

    this.barrelForEach(config);
  }

  barrelForEach(config) {
    config.barrelList.forEach((barrel) => {
      const newConfig = { ...barrel,
        ...config
      };
      this.barrelForMultiple(newConfig);
    });
  }

  barrelForMultiple(config) {
    if (!this.barrelGroup && !this.barrelGroup.children) {
      return;
    }

    this.barrelGroup.getChildren().forEach(data => {
      if (data.body.x > 640 || data.body.y > 360) {
        this.barrelGroup.kill(data);
      }
    });

    if (!this.barrelGroup && !this.barrelGroup.children) {
      return;
    }

    const barril = this.barrelGroup.getFirstDead(true, config.customConfig.x, config.customConfig.y, config.groupConfig.key);

    if (barril === null) return;

    if (!barril.getData('configured')) {
      barril.body.setSize(barril.body.sourceWidth * 0.5, barril.body.height / 2, barril.body.sourceWidth * 0.5, barril.body.height / 2)
    }


    if (barril) {
      this.startBarrelInteraction(barril, config);
    }
  }

  startBarrelInteraction(barril, config) {
    barril.setDataEnabled();
    barril.setData('configured', true);
    barril.active = true;
    barril.visible = true;
    barril.anims.play('rolling');
    barril.setVelocityX(config.customConfig.speedDirection);
    if (config.customConfig.speedDirection > 0) {
      barril.flipX = true;
    }
    this.barrelOverlap(config);
    this.barrelCollider(config);
  }

  barrelCollider(config) {
    this.config.scene.physics.add.collider(config.barrelGroup, [...config.colliderList], function (barrel, collider) {
      if (barrel.anims.currentAnim.key !== 'explosion') {
        if (barrel.body.onWall()) {
          this.killBarrel(barrel, config.barrelGroup);
          return;
        }
      }
    }, null, this);
  }

  barrelOverlap(config) {
    this.config.scene.physics.add.overlap(config.barrelGroup, [...config.overlapList], function (firstOverlap, barrel) {
      if (barrel.anims.currentAnim.key !== 'explosion') {
        if (barrel.body.touching.left || barrel.body.touching.right || barrel.body.touching.up) {
          this.killBarrel(barrel, config.barrelGroup);

          if (firstOverlap.name === 'odin') {
            const odinTakingDamage = firstOverlap.getData('takingDamage');
            if (!odinTakingDamage) {
              this.userInterface.events.emit('damageTaken', 250);
              firstOverlap.setData('takingDamage', true);
              this.config.scene.time.addEvent({
                delay: 1000,
                repeat: 0,
                callback: this.clearTakeDamage.bind(this, firstOverlap)
              });
            }
          }
          return;
        }
      }
    }, null, this);
  }

  clearTakeDamage(odin) {
    odin.setData('takingDamage', false);
  }

  createNewBarrel(config) {
    if (!this.barrelGroup && !this.barrelGroup.children) { return; }

    this.barrelGroup.getChildren().forEach(data => {
      if (data.body.x > 640 || data.body.y > 360) { this.barrelGroup.kill(data); }
    });

    if (!this.barrelGroup && !this.barrelGroup.children) { return; }

    const barril = this.barrelGroup.getFirstDead(true, this.config.customConfig.x, this.config.customConfig.y, this.config.groupConfig.key);

    if (barril === null) return;

    if (!barril.getData('configured')) {
      barril.body.setSize(barril.body.sourceWidth * 0.5, barril.body.height / 2, barril.body.sourceWidth * 0.5, barril.body.height / 2)
    }

    if (barril) { this.createSingleBarrel(barril, config); }
  }

  createSingleBarrel(barril, config) {
    barril.setDataEnabled();
    barril.setData('configured', true);
    barril.active = true;
    barril.visible = true;
    barril.anims.play('rolling');
    barril.setVelocityX(config.speedDirection);
    if (config.speedDirection > 0) {
      barril.flipX = true;
    }
    this.singleBarrelOverlap(config);
    this.singleBarrelCollider(config);
  }

  singleBarrelCollider(config) {
    this.config.scene.physics.add.collider(config.barrelGroup, [...config.colliderList], function (barrel, collider) {
      if (barrel.anims.currentAnim.key !== 'explosion') {
        if (barrel.body.onWall()) {
          this.killBarrel(barrel, config.barrelGroup);
          return;
        }
      }
    }, null, this);
  }

  singleBarrelOverlap(config) {
    this.config.scene.physics.add.overlap(config.barrelGroup, [...config.overlapList], function (firstOverlap, barrel) {
      if (barrel.anims.currentAnim.key !== 'explosion') {
        if (barrel.body.touching.left || barrel.body.touching.right || barrel.body.touching.up) {
          this.killBarrel(barrel, config.barrelGroup);
          if (firstOverlap.name === 'odin') {
            const odinTakingDamage = firstOverlap.getData('takingDamage');
            if (!odinTakingDamage) {
              this.userInterface.events.emit('damageTaken', 250);
              firstOverlap.setData('takingDamage', true);
              this.config.scene.time.addEvent({
                delay: 1000,
                repeat: 0,
                callback: this.clearTakeDamage.bind(this, firstOverlap)
              });
            }
          }
          return;
        }
      }
    }, null, this);
  }

  killBarrel(barrel, group) {
    barrel.body.setVelocityX(0);
    barrel.anims.play('explosion');
    if (barrel.anims.currentAnim.key === 'explosion') {
      this.scene.sound.play('explosao')
    }
    barrel.on('animationcomplete', function (animation, frame) {
      if (animation.key == 'explosion') {
        group.killAndHide(barrel);
      };
    });
  }

  queueBarrel(timing = 2000, callback, ...args) {
    this.barrelTimer = this.scene.time.addEvent({
      delay: timing,
      repeat: -1,
      callback: callback.bind(this, ...args)
    });
  }
}

export default BarrelSpawner;
