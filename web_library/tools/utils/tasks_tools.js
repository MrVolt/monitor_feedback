define(["require", "exports", 'gulp', 'gulp-util', 'chalk', 'gulp-load-plugins', 'run-sequence', 'fs', 'path', '../config'], function (require, exports, gulp, util, chalk, gulpLoadPlugins, _runSequence, fs_1, path_1, config_1) {
    "use strict";
    var TASKS_PATH = path_1.join(config_1.TOOLS_DIR, 'tasks');
    function loadTasks() {
        scanDir(TASKS_PATH, function (taskname) { return registerTask(taskname); });
    }
    exports.loadTasks = loadTasks;
    function task(taskname, option) {
        util.log('Loading task', chalk.yellow(taskname, option || ''));
        return require(path_1.join('..', 'tasks', taskname))(gulp, gulpLoadPlugins(), option);
    }
    exports.task = task;
    function runSequence() {
        var sequence = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sequence[_i - 0] = arguments[_i];
        }
        var tasks = [];
        var _sequence = sequence.slice(0);
        sequence.pop();
        scanDir(TASKS_PATH, function (taskname) { return tasks.push(taskname); });
        sequence.forEach(function (task) {
            if (tasks.indexOf(task) > -1) {
                registerTask(task);
            }
        });
        return _runSequence.apply(void 0, _sequence);
    }
    exports.runSequence = runSequence;
    function registerTask(taskname, filename, option) {
        if (option === void 0) { option = ''; }
        gulp.task(taskname, task(filename || taskname, option));
    }
    function scanDir(root, cb) {
        if (!fs_1.existsSync(root))
            return;
        walk(root);
        function walk(path) {
            var files = fs_1.readdirSync(path);
            for (var i = 0; i < files.length; i += 1) {
                var file = files[i];
                var curPath = path_1.join(path, file);
                if (fs_1.lstatSync(curPath).isFile() && /\.ts$/.test(file)) {
                    var taskname = file.replace(/(\.ts)/, '');
                    cb(taskname);
                }
            }
        }
    }
});
//# sourceMappingURL=tasks_tools.js.map