import test from "./test.js";
let acwd, err;
[acwd, err] = os.getcwd();
let canvas = Screen.getMode();
var SCR_X = canvas.width;
var SCR_Y = canvas.height;
var X_MID = SCR_X / 2;
var Y_MID = SCR_Y / 2;
test("module test ok");
class transPulse {
    r; g; b; a; min=0; max=128; tickdir = true;
    constructor(R, G, B, A, MIN, MAX) {
        this.r = R;
        this.g = G;
        this.b = B;
        this.a = A;
        this.min = MIN;
        this.max = MAX;
    }
    
    tick( ) {
        if (this.a >= this.max) {
            this.tickdir = false;
        }
        if (this.a <= this.min) {
            this.tickdir = true;
        }
        if (this.tickdir) {this.a++;} else {this.a--;};
        return Color.new(this.r,this.g,this.b,this.a);
    }
}

function colorprint(f, x, y, txt, col) {
    let t = f.color;
    f.color = col;
    f.print(x, y, txt);
    f.color = t;
  }

let fr_float = Math.fround(15.6787869696);
console.log(fr_float);

let bg = new Image("dash/246.png");
bg.filter = NEAREST;
bg.color = Color.new(128,128,128);
/*
for (let i = 0; i < bg_palette.length; i += 4) {
    bg_palette[i+0] = Math.trunc(bg_palette[i+0] * 0.2f);
    bg_palette[i+1] = Math.trunc(bg_palette[i+1] * 0.0f);
    bg_palette[i+2] = Math.trunc(bg_palette[i+2] * 1.0f);
}*/

const unsel_color = Color.new(255, 255, 255, 64);
const sel_color = Color.new(255, 255, 255);
const yellow = Color.new(255, 255, 0);

let font = new Font("fonts/LEMONMILK-Light.otf");
let font_medium = new Font("fonts/CONSOLA.TTF");
let font_bold = new Font("fonts/CONSOLAB.TTF");
font.color = unsel_color;
font_bold.scale = 0.7f
font_medium.scale = 0.5f;
font.scale = 0.44f;

let no_icon = new Image("no_icon.png");
let dong = new Image("mc_coh.png"); dong.width = 100; dong.height = 100;

console.log(JSON.stringify(Tasks.get()));

let menu_ptr = 0;
let pad = Pads.get();
var ee_info = System.getCPUInfo();
let mem = undefined;

let UI = {
    MAINMENU: 1,
    INSTALL_DONGLE_TO_DONGLE: 2,
    INSTALL_VIRTMC_TO_DONGLE: 3,
    INSTALL_FOLDER_TO_DONGLE: 4,
    INSTALLING: 5,
};
let CUI = UI.MAINMENU;

let main_menu_opt = [
    {
        name: "install from one dongle to another",
        mode: UI.INSTALL_DONGLE_TO_DONGLE,
    },
    /*{
        name: "install from VMC to dongle",
        mode: UI.INSTALL_VIRTMC_TO_DONGLE,
    },*/
    {
        name: "install from Folder to dongle",
        mode: UI.INSTALL_FOLDER_TO_DONGLE,
    }
];
let T = new transPulse(255,255,255,120,0,128);

class mcinfo {
    ports = [undefined, undefined];
    constructor() {
        this.get(0);
        this.get(1);
    }
    get(port) {
        this.ports[port] = System.getMCInfo(port);
        return this.ports[port];
    }
    ok(port, type) {
        return (this.ports[port].type == type && this.ports[port].froamt == 1);
    }
}
let Mcinfo = new mcinfo();
let tdong;
/*
console.log("std.exists(host:/VMC.BIN)", std.exists( "host:/VMC.BIN"));
let D = System.listDir("fake:");
let ret = System.fileXioMount("vmc:", "host:/VMC.BIN", System.FIO_MT_RDWR);
console.log("mountvmc:", ret);
D = System.listDir("vmc:");
for (let i = 0; i < D.length; i++) {
    console.log("ENTRY:",
    D[i].name,
    D[i].size,
    D[i].dir);
    
}
System.fileXioUmount("vmc:");*/


function progress(msg, prog) {
    Screen.clear();
    font.print(X_MID-200, Y_MID-30, msg);
    Draw.rect(X_MID-200, Y_MID, 100*4, 5, unsel_color);
    Draw.rect(X_MID-(prog*2), Y_MID, prog*4, 5, sel_color);
    Screen.flip();
}

os.setInterval(() => {
    mem = System.getMemoryStats();
    pad.update();
    //dong.color = T.tick();
    //console.log(dong.color)
    Screen.clear();

    //bg.draw(0, 0);
    font.print(15, 420, `RAM Usage: ${Math.floor(mem.used / 1024)}KB / ${Math.floor(ee_info.RAMSize / 1024)}KB`);

    font_bold.print(15, 5, "DongleBinder");
    if (CUI == UI.MAINMENU) {
        colorprint(font_medium, 20, 140, main_menu_opt[0].name, yellow);
        for(let i = 1; i < (main_menu_opt.length < 10? main_menu_opt.length : 10); i++) {
            //font.print(21200, 125+(23*i), main_menu_opt[i].name);
            colorprint(font_medium, 20, 140+(23*i), main_menu_opt[i].name, sel_color);
        }
        if(pad.justPressed(Pads.UP)) {
            main_menu_opt.unshift(main_menu_opt.pop());
        }
    
        if(pad.justPressed(Pads.DOWN)) {
            main_menu_opt.push(main_menu_opt.shift());
        }
    
        if(pad.justPressed(Pads.CROSS)){
            CUI = main_menu_opt[0].mode;
            Mcinfo.get(0);
            Mcinfo.get(1);
        }
    
    } else if (CUI == UI.INSTALL_DONGLE_TO_DONGLE) {
        
        if(pad.justPressed(Pads.LEFT)) {
            tdong = 0;
        }
    
        if(pad.justPressed(Pads.RIGHT)) {
            tdong = 1;
        }
        if(pad.justPressed(Pads.CROSS)) {
            if (!std.exists("mc"+(tdong^1)+":boot.bin"))
            Screen.clear(); Screen.flip();
            os.sleep(700);
            progress("Formatting target Dongle", 0);
            System.mcFormat(tdong, 0);os.sleep(1500);
            progress("Formatting target Dongle", 0);
            progress("Checking...", 0);
            Mcinfo.get(tdong);
            if (!Mcinfo.ok(tdong, 2)) {}
            progress("Format OK!", 0);
            progress("Binding 'boot.bin' to target dongle", 0);
            progress("boot.bin bound. begining file transfer", 0);
            let D = System.listDir("mc"+(tdong^1)+":");
            for (let i = 0; i < D.length; i++) {
                if (D[i].dir) continue;
                if (D[i].name == "boot.bin") continue;
                console.log("COPY:",
                D[i].name,
                D[i].size,
                D[i].dir);
                progress(`Copying: '${D[i].name}'...`, i*100/D.length); os.sleep(1500);
                
            }
        }
        if(pad.justPressed(Pads.CIRCLE)) {
            CUI = UI.MAINMENU
        }
        
        //if (mcinfo[0].type == 2 && mcinfo[0].format == 1) {}
        //if (mcinfo[1].type == 2 && mcinfo[1].format == 1) {}
        dong.draw(80, 100);
        dong.draw(320, 100);
        colorprint(font_bold, 250, 150, tdong==1 ? ">" : "<", sel_color);
        colorprint(font_medium, 100, 260, "Dongle0", sel_color);
        colorprint(font_medium, 340, 260, "Dongle1", sel_color);
        colorprint(font, 100, 280, `format: ${Mcinfo.ports[0].type}`, sel_color);
        colorprint(font, 340, 280, `format: ${Mcinfo.ports[1].type}`, sel_color);
        colorprint(font, 100, 310, `Free Space:${Mcinfo.ports[0].freemem}KB`, sel_color);
        colorprint(font, 340, 310, `Free Space:${Mcinfo.ports[1].freemem}KB`, sel_color);
        colorprint(font, 100, 330, `formatted: ${Mcinfo.ports[0].format == 1}`, sel_color);
        colorprint(font, 340, 330, `formatted: ${Mcinfo.ports[1].format == 1}`, sel_color);
    }

    
    Screen.flip();
}, 0);