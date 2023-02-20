#ifndef DPRINTF_H
#define DPRINTF_H

#ifdef EESIO_DEBUG
    #include <SIOCookie.h>
    #define DPRINTF(x...) fprintf(EE_SIO, x)
    #define DEBUG_START() ee_sio_start(38400, 0, 0, 0, 0)
#endif

#ifndef DEBUG_START
    #define DEBUG_START()
#endif
#ifndef DPRINTF
    #define DPRINTF(x...)
#endif

#endif // DPRINTF_H