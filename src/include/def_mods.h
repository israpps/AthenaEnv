#include <sifrpc.h>
#include <loadfile.h>
#include <libmc.h>
#include <audsrv.h>
#include <iopheap.h>
#include <iopcontrol.h>
#include <smod.h>

#include <sbv_patches.h>
#include <smem.h>

#include <libpwroff.h>

#include <libds34bt.h>
#include <libds34usb.h>

#include "pad.h"

#include <netman.h>
#include <ps2ip.h>

#include <stdbool.h>

#define irx_define(mod)               \
    extern unsigned char mod##_irx[] __attribute__((aligned(16))); \
    extern unsigned int size_##mod##_irx

extern bool kbd_started;
extern bool mouse_started;
extern bool freeram_started;
extern bool ds34bt_started;
extern bool ds34usb_started;
extern bool network_started;
extern bool sio2man_started;
extern bool usbd_started;
extern bool usb_mass_started;
extern bool pads_started;
extern bool audio_started;
extern bool cdfs_started;
extern bool dev9_started;
extern bool mc_started;
extern bool hdd_started;
extern bool filexio_started;

/// @brief list of modules ID to be used with `load_default_module` loads the mentioned module and manages their IRX dependencies
/// @see load_default_module
enum MODLIST {
    USBD_MODULE = 0,
    KEYBOARD_MODULE,
    MOUSE_MODULE,
    FREERAM_MODULE,
    DS34BT_MODULE,
    DS34USB_MODULE,
    NETWORK_MODULE,
    USB_MASS_MODULE,
    PADS_MODULE,
    AUDIO_MODULE,
    CDFS_MODULE,
    MC_MODULE,
    HDD_MODULE,
    FILEXIO_MODULE,
    SIO2MAN_MODULE,
}

#define BOOT_MODULE 99

irx_define(iomanX);
irx_define(fileXio);
irx_define(sio2man);
irx_define(mcman);
irx_define(mcserv);
irx_define(padman);
irx_define(mtapman);
irx_define(libsd);
irx_define(cdfs);
irx_define(usbd);
irx_define(bdm);
irx_define(bdmfs_fatfs);
irx_define(usbmass_bd);
irx_define(ps2dev9);
irx_define(ps2atad);
irx_define(ps2hdd);
irx_define(ps2fs);
irx_define(SMAP);
irx_define(NETMAN);
irx_define(audsrv);
irx_define(ps2kbd);
irx_define(ps2mouse);
irx_define(freeram);
irx_define(ds34bt);
irx_define(ds34usb);
irx_define(poweroff);

int get_boot_device(const char* path);

int load_default_module(int id);

