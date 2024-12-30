import test from "./test.js";

test("module test ok");

let fr_float = Math.fround(15.6787869696);
console.log(fr_float);

function listgames(value) {
  console.log("  ["+value.title+"]:["+value.dongle+"]")
}

const unsel_color = Color.new(255, 255, 255, 64);
const whtsol = Color.new(255, 255, 255, 128);
const sel_color = Color.new(255, 255, 0);

let s = {
    _246: new Image("render_icon.png"),
    _256: new Image("render_icon.png"),
};
let gpad = new Image("pads_icon.png"); gpad.width =64; gpad.height =64; gpad.color = sel_color;
let bg = new Image("aclauncher/bg.png");
bg.width = 640; bg.height = 480; //bg.filter = NEAREST;
const bg_palette = new Uint8Array(bg.palette);
bg.color = Color.new(255, 10, 20, 128)
for (let i = 0; i < bg_palette.length; i += 4) {
    bg_palette[i+0] = Math.trunc(bg_palette[i+0] * 1.2f);
    bg_palette[i+1] = Math.trunc(bg_palette[i+1] * 0.0f);
    bg_palette[i+2] = Math.trunc(bg_palette[i+2] * 0.2f);
}

console.log("Image size: " + bg.size + " | bits per pixel: " + bg.bpp);

let tfont = new Font("fonts/LEMONMILK-Bold.otf");
let font = new Font("fonts/LEMONMILK-Medium.otf");
let logfont = new Font("fonts/LEMONMILK-Light.otf");
let font_medium = new Font("aclauncher/namco.ttf");
let font_bold = new Font("aclauncher/namco.ttf");
font.color = unsel_color;
font_bold.scale = 0.5f
font_medium.scale = 0.44f;
font.scale = 0.44f;
tfont.scale = 0.54f;
logfont.scale = 0.34f;

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

let pad = Pads.get();
var ee_info = System.getCPUInfo();
let mem = undefined;
let dsginfo = false;
const UISTATE = {
    SYSTEMQUERY: 1,
    GAMELIST: 2,
};
const GCOMPAT = {
    INCOMPATIBLE: 0,
    COMPATIBLE: 1,
    UNKNOWN: 2,
    HAS_ISSUES: 3,
};
const GCOMPATS = ["Incompatible", "Compatible", "Unknown", "Confirmed Issues"];
const CCOMPATS = [Color.new(255,0,0, 64), whtsol, unsel_color, Color.new(255,255,0, 64)];
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
    256: gdb_256,
};

function SysQuery() {
    font.print(20, 30, "choose device");
    if(pad.justPressed(Pads.LEFT)) {
        CURSYSTEM = 246;
        s._246.color = sel_color;
        s._256.color = whtsol;
    } else if(pad.justPressed(Pads.RIGHT)){
        CURSYSTEM = 256;
        s._246.color = whtsol;
        s._256.color = sel_color;
    } if(pad.justPressed(Pads.CROSS)){
        CUISTATE = UISTATE.GAMELIST;
    }
    colorprint(font_medium, 85, 111, "system", CURSYSTEM == 246 ? sel_color : unsel_color);
    colorprint(font_bold, 110, 130, "246", CURSYSTEM == 246 ? sel_color : unsel_color);
    s._246.draw(85,140);
    colorprint(font_medium, 485, 111, "system", CURSYSTEM == 256 ? sel_color : unsel_color);
    colorprint(font_bold, 510, 130, "256", CURSYSTEM == 256 ? sel_color : unsel_color);
    s._256.draw(485, 140);
    font.print(250, 420, `registered games: ${CURSYSTEM == 256 ? gdb_256.games.length : gdb_246.games.length}`);
}
function DisplayGlist() {
    if(pad.justPressed(Pads.UP)) {
        app_table[CURSYSTEM].games.unshift(app_table[CURSYSTEM].games.pop());
    } else if(pad.justPressed(Pads.DOWN)){
        app_table[CURSYSTEM].games.push(app_table[CURSYSTEM].games.shift());
    } else if(pad.justPressed(Pads.CROSS)){
        console.log("launch game "+app_table[CURSYSTEM].games[0].dongle)
    } else if(pad.justPressed(Pads.CIRCLE)){
        CUISTATE = UISTATE.SYSTEMQUERY;
    } else if(pad.justPressed(Pads.TRIANGLE)){
        dsginfo = !dsginfo;
    }
    if (dsginfo) {
        Draw.rect(0, 50, 640, 250, Color.new(0,0,0, 40))
        Draw.rect(0, 50, 640, 1, whtsol)
        Draw.rect(0, 250+50, 640, 1, whtsol)
        colorprint(tfont, 60, 60, app_table[CURSYSTEM].games[0].title, sel_color);
        colorprint(tfont, 400, 80, app_table[CURSYSTEM].games[0].media, sel_color);
        if (app_table[CURSYSTEM].games[0].gamepad) gpad.draw(390, 110)
        colorprint(font, 60,  80, "Release: ", whtsol); colorprint(font, 210,  80, app_table[CURSYSTEM].games[0].date, whtsol);
        colorprint(font, 60, 100, "Publisher: ", whtsol); colorprint(font, 210, 100, app_table[CURSYSTEM].games[0].publisher, whtsol);
        colorprint(font, 60, 120, "GameID: ", whtsol); colorprint(font, 210, 120, app_table[CURSYSTEM].games[0].gameid, whtsol);
        colorprint(font, 60, 140, "DongleID: ", whtsol); colorprint(font, 210, 140, app_table[CURSYSTEM].games[0].dongle, whtsol);

        colorprint(font, 60, 170, "Compatibility: ", sel_color);
        colorprint(font, 70, 190, "System 246 Driving : ", whtsol); colorprint(font, 210, 190, GCOMPATS[app_table[CURSYSTEM].games[0].compat[0]], CCOMPATS[app_table[CURSYSTEM].games[0].compat[0]]);
        colorprint(font, 70, 210, "System 246 A : ", whtsol); colorprint(font, 210, 210, GCOMPATS[app_table[CURSYSTEM].games[0].compat[1]], CCOMPATS[app_table[CURSYSTEM].games[0].compat[1]]);
        colorprint(font, 70, 230, "System 246 B : ", whtsol); colorprint(font, 210, 230, GCOMPATS[app_table[CURSYSTEM].games[0].compat[2]], CCOMPATS[app_table[CURSYSTEM].games[0].compat[2]]);
        colorprint(font, 70, 250, "System 246 C : ", whtsol); colorprint(font, 210, 250, GCOMPATS[app_table[CURSYSTEM].games[0].compat[3]], CCOMPATS[app_table[CURSYSTEM].games[0].compat[3]]);
        colorprint(font, 70, 270, "System 256 : ", whtsol); colorprint(font, 210, 270, GCOMPATS[app_table[CURSYSTEM].games[0].compat[4]], CCOMPATS[app_table[CURSYSTEM].games[0].compat[4]]);
        
    } else {
        colorprint(font, 60, 60, app_table[CURSYSTEM].games[0].title, sel_color);
    
        for(let i = 1; i < (app_table[CURSYSTEM].length < 14? app_table[CURSYSTEM].length : 14); i++) {
            font.print(60, 60+(23*i), app_table[CURSYSTEM].games[i].title);
        }
    }
}

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
        DisplayGlist();
    } else if (CUISTATE == UISTATE.SYSTEMQUERY) {
        SysQuery();
    }
    
    Screen.flip();
}, 0);