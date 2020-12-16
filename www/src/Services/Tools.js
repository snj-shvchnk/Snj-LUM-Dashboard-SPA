const Tools = {
    
    debounce: (handler, preload) => {
        let timeout;
        return (...args) => {
                clearTimeout(timeout);
                if (args.kill_timers === true) 
                    return;

                timeout = setTimeout(() => {
                    handler.apply(this, args);
                }, preload);
            };
    },

};

export default Tools;