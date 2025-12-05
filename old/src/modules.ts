// During migration, prefer TS modules first, then fallback legacy JS loader
import './ts/config';
import './ts/utils';
import './ts/input';
import './ts/soundGenerator';
import './ts/audio';
import './ts/saveSystem';
import './ts/sprites';
import './ts/particles';
import './ts/ui';
import './ts/screens';
import './ts/weapons';
import './ts/entities';
import './ts/gameEngine';
// Legacy JS loader removed after full TS migration
