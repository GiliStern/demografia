import telAvivLoopBg from "./bg/tel_aviv_loop2.png";

import mainBanner from "./main_banner.png";

import chairIcon from "./icons/chair_icon.png";
import chickenCircleIcon from "./icons/chicken_circle.png";
import pitaIcon from "./icons/pita_icon.png";
import srulikIcon from "./icons/srulik_icon.png";
import starOfDavidIcon from "./icons/star_of_david_icon.png";

import jerusalemTheme from "./music/jerusalem_theme.wav";
import telAvivTheme from "./music/tel_aviv_theme.wav";

import chestOpenSfx from "./sfx/chest_open.wav";
import hitSfx from "./sfx/hit.wav";
import levelUpSfx from "./sfx/levelup.wav";
import menuClickSfx from "./sfx/menu_click.wav";
import pickupSfx from "./sfx/pickup.wav";

import catSprite from "./sprites/cat.png";
import chairSprite from "./sprites/chair.png";
import chickenSprite from "./sprites/chicken.png";
import hipsterSprite from "./sprites/hipster.png";
import pitaSprite from "./sprites/Pita.png";
import pricklySprite from "./sprites/prickly.png";
import scooterSwarmSprite from "./sprites/scooter swarm.png";
import srulik512Sprite from "./sprites/srulik_512x512.png";
import starOfDavidSprite from "./sprites/star_of_david.png";
import tiktokStarSprite from "./sprites/tiktok star.png";
import touristSprite from "./sprites/tourist.png";
import xpSprite from "./sprites/xp.png";

// Passive item sprites
import candlesSprite from "./sprites/passive-items/candles.png";
import gatSprite from "./sprites/passive-items/gat.png";
import madaSprite from "./sprites/passive-items/mada.png";
import priviledgeSprite from "./sprites/passive-items/priviledge.png";
import protectionSprite from "./sprites/passive-items/protection.png";
import wassachSprite from "./sprites/passive-items/wassach.png";
import wingsSprite from "./sprites/passive-items/wings.png";
import increaseJoySprite from "./sprites/passive-items/increaseJoy.png";
import attractionSprite from "./sprites/passive-items/attraction.png";
import outstretchedArmSprite from "./sprites/passive-items/arm.png";
import hallaSprite from "./sprites/passive-items/hallah.png";
import crownSprite from "./sprites/passive-items/crown.png";
import extensionSprite from "./sprites/passive-items/extension.png";
import greedSprite from "./sprites/passive-items/greed.png";
import evilEyeSprite from "./sprites/passive-items/evil_eye.png";
import { PassiveId } from "@/types";

export const bg = {
  telAvivLoop: telAvivLoopBg,
};

export const banners = {
  main: mainBanner,
};

export const icons = {
  chair: chairIcon,
  chicken: chickenCircleIcon,
  pita: pitaIcon,
  srulik: srulikIcon,
  starOfDavid: starOfDavidIcon,
};

export const music = {
  jerusalemTheme,
  telAvivTheme,
};

export const sfx = {
  chestOpen: chestOpenSfx,
  hit: hitSfx,
  levelUp: levelUpSfx,
  menuClick: menuClickSfx,
  pickup: pickupSfx,
};

export const sprites = {
  cat: catSprite,
  chair: chairSprite,
  chicken: chickenSprite,
  hipster: hipsterSprite,
  pita: pitaSprite,
  prickly: pricklySprite,
  scooterSwarm: scooterSwarmSprite,
  srulik512: srulik512Sprite,
  starOfDavid: starOfDavidSprite,
  tiktokStar: tiktokStarSprite,
  tourist: touristSprite,
  xp: xpSprite,
};

export const passiveSprites: Record<PassiveId, string> = {
  [PassiveId.IncreaseJoy]: increaseJoySprite,
  [PassiveId.ShabbatCandles]: candlesSprite,
  [PassiveId.Gat]: gatSprite,
  [PassiveId.MDA]: madaSprite,
  [PassiveId.Privilege]: priviledgeSprite,
  [PassiveId.Protection]: protectionSprite,
  [PassiveId.Wassach]: wassachSprite,
  [PassiveId.WingsOfDivinePresence]: wingsSprite,
  [PassiveId.Magnet]: attractionSprite,
  [PassiveId.OutstretchedArm]: outstretchedArmSprite,
  [PassiveId.Clover]: hallaSprite,
  [PassiveId.Crown]: crownSprite,
  [PassiveId.Extension]: extensionSprite,
  [PassiveId.Greed]: greedSprite,
  [PassiveId.EvilEye]: evilEyeSprite,
};

export const placeholders = {
  sprite: starOfDavidSprite,
  passive: priviledgeSprite, // Default placeholder for passives without graphics
};
