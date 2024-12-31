#include "ath_env.h"
#define NEWLIB_PORT_AWARE
#include <fileXio_rpc.h>
#include "include/mmce.h"
#define MAX_GAMEID_LEN 256

char mmce[] = "mmce0:";
#define SETSLOT() mmce[4] = slot+'0'

#define JSMODDEF(fun) static JSValue fun(JSContext *ctx, JSValue this_val, int argc, JSValueConst *argv)

int Icardping(int slot, int timeout, int* prodid, int* revid, int* protid);
int Igetcard(int slot);
int Igetgameid(int slot, char* ret);
int Isetgameid(int slot, const char *gameid);

JSMODDEF(mmce_ping) {
    JSValue obj;
    int32_t delay = 5, slot;
    int prodid = -1, //Product
        revid = -1, // Revision
        protid = -1; //Protocol version
    JS_ToInt32(ctx, &slot, argv[0]);
    if (argc > 1) JS_ToInt32(ctx, &delay, argv[1]);
    int ret = Icardping(slot, delay, &prodid, &revid, &protid);
    if (ret != -1) {
        obj = JS_NewObject(ctx);
        JS_DefinePropertyValueStr(ctx, obj, "product", JS_NewUint32(ctx, prodid), JS_PROP_C_W_E);
        JS_DefinePropertyValueStr(ctx, obj, "revision", JS_NewUint32(ctx, revid), JS_PROP_C_W_E);
        JS_DefinePropertyValueStr(ctx, obj, "protocol", JS_NewUint32(ctx, protid), JS_PROP_C_W_E);
        return obj;
    }
    return JS_UNDEFINED;
}

JSMODDEF(mmce_setgameid) {
    int32_t slot;
    const char* v = NULL;
    JS_ToInt32(ctx, &slot, argv[0]);
    v = JS_ToCString(ctx, argv[1]);
	return JS_NewInt32(ctx, Isetgameid(slot, v));
}

JSMODDEF(mmce_getgameid) {
    int32_t slot;
    char ret[MAX_GAMEID_LEN];
    JS_ToInt32(ctx, &slot, argv[0]);
    if (Igetgameid(slot, ret) != -1) return JS_NewString(ctx, ret);
    return JS_UNDEFINED;
}


static const JSCFunctionListEntry module_funcs[] = {
    //JS_CFUNC_DEF("init", 0, athena_mouse_init_f),
    JS_CFUNC_DEF("Ping", 1, mmce_ping),
    //JS_CFUNC_DEF("GetStatus", 4, mmce_status),
    //JS_CFUNC_DEF("GetCard", 1, mmce_getcard),
    //JS_CFUNC_DEF("SetCard", 1, mmce_setcard),
    //JS_CFUNC_DEF("SetChannel", 1, mmce_setchan),
    //JS_CFUNC_DEF("GetChannel", 1, mmce_getchan),
    JS_CFUNC_DEF("SetGameID", 1, mmce_setgameid),
    JS_CFUNC_DEF("GetGameID", 1, mmce_getgameid),
    //JS_CFUNC_DEF("ioctl_ProbePort", 1, mmce_probeport),
};

int Icardping(int slot, int timeout, int* prodid, int* revid, int* protid)
{
    int res;
    SETSLOT();
    
    dbgprintf("%s(%d)\n", __func__, slot);
    res = fileXioDevctl(mmce, MMCEMAN_CMD_PING, NULL, 0, NULL, 0);
    dbgprintf("%s(%d) return %d (0x%x)\n", __func__, slot, res, res);
    if (res != -1) {
        if (((res & 0xFF00) >> 8) == 1) {
            dbgprintf("Product id: 1 (SD2PSX)\n");
        } else if (((res & 0xFF00) >> 8) == 2) {
            dbgprintf("Product id: 2 (MemCard PRO2)\n");
        } else {
            dbgprintf("Unknown Product id: %d (unknown)\n", ((res & 0xFF00) >> 8));
        }
        dbgprintf("Revision id: %i\n", (res & 0xFF));
        dbgprintf("Protocol Version: %i\n", (res & 0xFF0000) >> 16);
        if (prodid) *prodid = ((res & 0xFF00) >> 8);
        if (revid) *revid = (res & 0xFF);
        if (protid) *protid = ((res & 0xFF0000) >> 16);
    }
    return res;
}


int Igetcard(int slot)
{
    int res;
    SETSLOT();

    res = fileXioDevctl(mmce, MMCEMAN_CMD_GET_CARD, NULL, 0, NULL, 0);
    /*if (res != -1) {
        dbgprintf("[PASS] current card: %i\n", res);
    } else {
        dbgprintf("[FAIL] error: %i\n", res);
    }*/
    return res;
}

int Igetgameid(int slot, char* ret)
{
    int res;
    SETSLOT();
    char gameid[MAX_GAMEID_LEN];
    
    res = fileXioDevctl(mmce, MMCEMAN_CMD_GET_GAMEID, NULL, 0, &gameid, MAX_GAMEID_LEN);

    if (res != -1) strncpy(ret, gameid, MAX_GAMEID_LEN);
    return res;
}

int Isetgameid(int slot, const char *gameid)
{
    int res;
    SETSLOT();
    char new_gameid[MAX_GAMEID_LEN];
    
    strncpy(new_gameid, gameid, MAX_GAMEID_LEN);


    res = fileXioDevctl(mmce, MMCEMAN_CMD_SET_GAMEID, gameid, MAX_GAMEID_LEN, NULL, 0);
    if (res == -1) {
        //dbgprintf("[FAIL] error setting GameID: %i\n", res);
    }

    return res;
}


static int module_init(JSContext *ctx, JSModuleDef *m)
{
    return JS_SetModuleExportList(ctx, m, module_funcs, countof(module_funcs));
}

JSModuleDef *athena_mmce_init(JSContext* ctx){
    return athena_push_module(ctx, module_init, module_funcs, countof(module_funcs), "mmce");
}
