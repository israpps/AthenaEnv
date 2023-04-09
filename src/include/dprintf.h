#ifdef DEBUG
#include <SIOCookie.h>
#define dprintf(format, args...) sio_printf(format, ##args)
#define DPRINTF_INIT() ee_sio_start(38400, 0, 0, 0, 0)
#endif


#ifndef dprintf
#define dprintf(format, args...)
#endif

#ifndef DPRINTF_INIT
#define DPRINTF_INIT()
#endif