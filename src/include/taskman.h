typedef struct Task {
    int id;
    int internal_id;
    const char* title;
} Task;

typedef struct Tasklist {
    int size;
    Task** list;
} Tasklist;

extern void init_taskman();

extern int create_task(const char* title, void* func, int stack_size, int priority);

extern void init_task(int id, void* args);

extern void kill_task(int id);

extern void exitkill_task();

extern Tasklist* get_tasklist();