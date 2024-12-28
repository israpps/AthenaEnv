import test from "./test.js";

test("module test ok");

let fr_float = Math.fround(15.6787869696);
console.log(fr_float);

function listgames(value) {
  console.log("  ["+value.title+"]:["+value.dongle+"]")
}

//IOP.loadDefaultModule(IOP.keyboard);
//Keyboard.init();

let bg = new Image("aclauncher/bg.png");
bg.width = 640; bg.height = 480; //bg.filter = NEAREST;
const bg_palette = new Uint8Array(bg.palette);

for (let i = 0; i < bg_palette.length; i += 4) {
    bg_palette[i+0] = Math.trunc(bg_palette[i+0] * 1.2f);
    bg_palette[i+1] = Math.trunc(bg_palette[i+1] * 0.0f);
    bg_palette[i+2] = Math.trunc(bg_palette[i+2] * 0.2f);
}

console.log("Image size: " + bg.size + " | bits per pixel: " + bg.bpp);

const unsel_color = Color.new(255, 255, 255, 64);
const sel_color = Color.new(255, 255, 0);

let font = new Font("fonts/LEMONMILK-Light.otf");
let logfont = new Font("fonts/LEMONMILK-Light.otf");
let font_medium = new Font("aclauncher/namco.ttf");
let font_bold = new Font("aclauncher/namco.ttf");
font.color = unsel_color;
font_bold.scale = 0.5f
font_medium.scale = 0.44f;
font.scale = 0.44f;
logfont.scale = 0.34f;

let no_icon = new Image("no_icon.png");

console.log(JSON.stringify(Tasks.get()));

let file = std.open("aclauncher/246.json", "r");
var gdb_246 = JSON.parse(file.readAsString());
file.close()
file = std.open("aclauncher/256.json", "r");
var gdb_256 = JSON.parse(file.readAsString());
file.close()
console.log("246:")
gdb_246.games.forEach(listgames);
console.log("256:")
gdb_256.games.forEach(listgames);
let menu_ptr = 0;

let pad = Pads.get();

let old_kbd_char = 0;
let kbd_char = 0;

const VK_OLD_UP = 27;
const VK_NEW_UP = 44;
const VK_OLD_DOWN = 27;
const VK_NEW_DOWN = 43;
const VK_RETURN = 10;

var ee_info = System.getCPUInfo();

let mem = undefined;
const UISTATE = {
    SYSTEMQUERY: 1,
    GAMELIST: 2,
};
var CURSYSTEM = 246;
var CUISTATE = UISTATE.SYSTEMQUERY;

function colorprint(f, x, y, txt, col) {
    var t = f.color;
    f.color = col;
    f.print(x, y, txt);
    f.color = t;
  }
var app_table = {
    246: gdb_246,
    266: gdb_256,
};
os.setInterval(() => {
    pad.update();

    //old_kbd_char = kbd_char;
    //kbd_char = Keyboard.get();

    Screen.clear();

    bg.draw(0, 0);

    font_bold.print(20, 10, "multidongle launcher");

    mem = System.getMemoryStats();

    //font.print(15, 420, `Temp: ${System.getTemperature() === undefined? "NaN" : System.getTemperature()} C | RAM Usage: ${Math.floor(mem.used / 1024)}KB / ${Math.floor(ee_info.RAMSize / 1024)}KB`);
    logfont.print(15, 420, `RAM Usage: ${Math.floor(mem.used / 1024)}KB / ${Math.floor(ee_info.RAMSize / 1024)}KB`);
    if(CUISTATE == UISTATE.GAMELIST) {
        if(pad.justPressed(Pads.UP)) {
            app_table[CURSYSTEM].games.unshift(app_table[CURSYSTEM].games.pop());
        } else if(pad.justPressed(Pads.DOWN)){
            app_table[CURSYSTEM].games.push(app_table[CURSYSTEM].games.shift());
        } else if(pad.justPressed(Pads.CROSS)){
        } else if(pad.justPressed(Pads.CIRCLE)){
            CUISTATE = UISTATE.SYSTEMQUERY;
        }
        
        colorprint(font, 60, 60, app_table[CURSYSTEM].games[0].title, sel_color);
        colorprint(font, 420, 340, "Release: "+app_table[CURSYSTEM].games[0].date, sel_color);
        colorprint(font, 420, 360, "Publisher: "+app_table[CURSYSTEM].games[0].publisher, sel_color);
        colorprint(font, 420, 380, "GameID: "+app_table[CURSYSTEM].games[0].gameid, sel_color);
        colorprint(font, 420, 400, "DongleID: "+app_table[CURSYSTEM].games[0].dongle, sel_color);
        //app_table[0].icon.draw(85, 111);
    
        for(let i = 1; i < (gdb_246.length < 14? gdb_246.length : 14); i++) {
            font.print(60, 60+(23*i), gdb_246.games[i].title);
        }
    } else if (CUISTATE == UISTATE.SYSTEMQUERY) {
        font.print(20, 30, "choose device");
        if(pad.justPressed(Pads.LEFT)) {
            CURSYSTEM = 246;
        } else if(pad.justPressed(Pads.RIGHT)){
            CURSYSTEM = 256;
        } if(pad.justPressed(Pads.CROSS)){
            CUISTATE = UISTATE.GAMELIST;
        }
        colorprint(font_medium, 85, 111, "system", CURSYSTEM == 246 ? sel_color : unsel_color)
        colorprint(font_bold, 85+25, 130, "246", CURSYSTEM == 246 ? sel_color : unsel_color)
        colorprint(font_medium, 485, 111, "system", CURSYSTEM == 256 ? sel_color : unsel_color)
        colorprint(font_bold, 485+25, 130, "256", CURSYSTEM == 256 ? sel_color : unsel_color)
        font.print(300, 420, `registered games: ${CURSYSTEM == 256 ? gdb_256.games.length : gdb_246.games.length}`);
    }
    
    Screen.flip();
}, 0);