'use strict';

import {compareArrays, formatNumber, whiteSpace} from './utils';
import {LinkedList} from './linked-list';

const CONTENT_TYPE = {
    FILE: 'file',
    DIR: 'dir',
};

const COMMAND = {
    EMPTY: '',
    DIR: 'dir',
    CD: 'cd',
    TYPE: 'type',
    CLS: 'cls',
    HELP: 'help',
};

/**
 * Implementation of the Controller (MVC) for the terminal window.
 **/
export class ShellController {
    /**
     * Constructor of ShellController.
     * @param {ShellView} shellView
     * @param {ShellService} shellService
     */
    constructor(shellView, shellService) {
        this.shellView = shellView;
        this.shellService = shellService;
        this.folderStack = [];
        this.commandMap = new Map([
            [COMMAND.EMPTY, {
                run: async () => {
                },
            }],
            [COMMAND.DIR, {
                run: async () => this.listContent(),
            }],
            [COMMAND.CD, {
                run: async (args) => this.changeDirectory(args),
                argType: CONTENT_TYPE.DIR,
            }],
            [COMMAND.TYPE, {
                run: async (args) => await this.cat(args),
                argType: CONTENT_TYPE.FILE,
            }],
            [COMMAND.CLS, {
                run: async () => this.clearScreen(),
            }],
            [COMMAND.HELP, {
                run: async () => this.help(),
            }],
        ]);
        this.history = new LinkedList();
    }

    /**
     * Initialize the state of the current directory.
     */
    async init() {
        try {
            this.currentDirectory = await this.shellService.getData();
        } catch (exception) {
            this.currentDirectory = {
                type: 'dir',
                astModified: '09/15/2018  02:39 PM',
                name: '',
                content: [
                    {
                        type: 'file',
                        lastModified: '12/27/2018 6:20 PM',
                        name: 'error.txt',
                        content: 'Could not retrieve data from the host. Please try again by refreshing the page.',
                        contentFile: 'none',
                        size: 6,
                    },
                ],
            };
        }
    }

    /**
     * Implementation of auto-fill functionality for arguments in case of commands.
     * @param {string} input -  current input string
     * @param {number} position -  value which holds the position of the potential argument from the current argument buffer
     */
    autoFillCommand(input, position) {
        if (!!input && input.match(/^([a-z]|[A-Z]).* */).length > 0) {
            // Get the index of the first space. The span input distinguishes between non breaking space and normal space,
            // this means whe have to get the minimum index of a space where the index itself is positive (the space
            // exists inside the input string).
            const indexOfFirstNonBreakingSpace = input.indexOf('\u00A0');
            const indexOfFirstNormalSpace = input.indexOf(' ');
            const indexOfSpace = (() => {
                if (indexOfFirstNonBreakingSpace > -1 && indexOfFirstNormalSpace > -1) {
                    return Math.min(indexOfFirstNormalSpace, indexOfFirstNonBreakingSpace);
                }
                return Math.max(indexOfFirstNonBreakingSpace, indexOfFirstNormalSpace, 0);
            })();
            if (indexOfSpace > 0) {
                const cmd = input.substring(0, indexOfSpace).toLowerCase();
                const args = input.substring(indexOfSpace + 1).toLowerCase();
                if (this.commandMap.has(cmd)) {
                    const eligibleContent = this.currentDirectory.content.filter((item) =>
                        item.type === this.commandMap.get(cmd).argType && item.name.startsWith(args));
                    if (eligibleContent.length > 0) {
                        const normalPosition = position % eligibleContent.length;
                        this.shellView.setPrompt(`${cmd} ${eligibleContent[normalPosition].name}`);
                    }
                }
            }
        }
    }

    /**
     * Parse the input string and process the command.
     * @param {string} input
     */
    async processCommand(input) {
        const words = input.trim().toLowerCase().split(' ');
        if (words.length > 0) {
            const command = words[0];
            const args = [...words.slice(1)];
            if (this.commandMap.has(command)) {
                await this.commandMap.get(command).run(args);
                const latestCommand = this.history.last ? this.history.last.value : [];
                if (command !== COMMAND.EMPTY &&
                    (command !== latestCommand[0] ||
                        !compareArrays(args, latestCommand[1], (a, b) => a === b))) {
                    this.history.last = [command, args];
                }
            } else {
                throw Error(`'${command}' is not recognized as an internal or external command,
                operable program or batch file.`);
            }
        }
    }

    /**
     * Fetches and displays the already executed commands. The method is used to navigate backwards in the history buffer.
     */
    historyBefore() {
        const commandWithArguments = this.history.navigateBackward();
        if (commandWithArguments) {
            const prompt = commandWithArguments.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue);
            this.shellView.setPrompt(prompt);
        }
    }

    /**
     * Fetches and displays the already executed commands. The method is used to navigate forward in the history buffer.
     */
    historyAfter() {
        const commandWithArguments = this.history.navigateForward();
        if (commandWithArguments) {
            const prompt = commandWithArguments.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue);
            this.shellView.setPrompt(prompt);
        }
    }

    /**
     * Implementation of the "dir" (list directory) command.
     */
    listContent() {
        const content = this.currentDirectory.content;
        let output = '<div>' +
            '<div><span>Directory of ' + this.computeCurrentPath() + '</span></div>';
        let sumFileSizes = 0;
        let countNumberOfFiles = 0;
        let countNumberOfDirectories = 0;
        for (const item of content) {
            let type;
            let size;
            if (item.type === CONTENT_TYPE.DIR) {
                type = '&nbsp&nbsp&lt;DIR&gt;';
                size = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                countNumberOfDirectories++;
            } else {
                type = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                size = formatNumber(item.size, 9);
                sumFileSizes += parseInt(item.size);
                countNumberOfFiles++;
            }
            output += `<div><span>${item.lastModified} ${type} ${size} ${item.name}</span></div>`;
        }
        output += '' +
            `<div>${whiteSpace(14)}${countNumberOfFiles} File(s) ${sumFileSizes} bytes</div>` +
            `<div>${whiteSpace(14)}${countNumberOfDirectories} Dir(s) ` +
            `${Math.floor((Math.random() * 1000) + 1000)} bytes free</div>` +
            '</div>';
        this.shellView.showHtmlOutput(output);
    }

    /**
     * Implementation of the "type" (cat, show file content) command.
     * @param {string} arg -  arguments string, this should contain the name of the file
     */
    async cat(arg) {
        if (arg.length > 0) {
            const filename = arg[0].trim();
            const files = this.currentDirectory.content.filter((item) =>
                item.name === filename && item.type === CONTENT_TYPE.FILE
            );
            if (files.length > 0) {
                const file = files[0];
                const content = file.content ? file.content : await this.shellService.getTextData(file.contentFile);
                this.shellView.showHtmlOutput(content);
            } else {
                throw Error(`File with the name ${filename} of does not exist!`);
            }
        } else {
            throw Error('Missing argument from command "type"! Usage: type [FILENAME]');
        }
    }

    /**
     * Implementation of the "cd" (change directory) command.
     * @param {string} arg -  arguments string, should contain the name of the directory where we will navigate to. In case
     * of backwards navigation, the string should contain ".."
     */
    changeDirectory(arg) {
        if (arg.length > 0) {
            const directoryName = arg[0].trim();
            if (directoryName === '..') {
                if (this.folderStack.length > 0) {
                    this.currentDirectory = this.folderStack.pop();
                    this.shellView.showHtmlOutput('');
                }
            } else {
                const dirs = this.currentDirectory.content.filter((item) => {
                    return item.name === directoryName && item.type === CONTENT_TYPE.DIR;
                });
                if (dirs.length > 0) {
                    this.folderStack.push(this.currentDirectory);
                    this.currentDirectory = dirs[0];
                    this.shellView.showHtmlOutput('');
                } else {
                    throw Error(`Directory with the name ${directoryName} of does not exist!`);
                }
            }
        } else {
            throw Error('Missing argument from command "cd"! Usage: cd [DIRNAME]');
        }
    }

    /**
     * Implementation of the "cls" (clear screen) command.
     */
    clearScreen() {
        this.shellView.clearScreen();
    }

    /**
     * Implementation of the "help' command.
     */
    help() {
        const output = '<div>Available commands: dir, type, cd, help.' +
            '<ul>' +
            '<li>dir: List the content of the current directory. Equivalent of "ls" command under Unix systems.</li>' +
            '<li>type: Show the content of a file. Equivalent of "cat" command under ' +
            'Unix systems. Usage: type [FILENAME]</li>' +
            '<li>cd: Navigate into a selected directory. Usage: cd [DIRNAME]. To navigate up: cd ..  </li>' +
            '<li>cls: Clear the terminal input screen.  </li>' +
            '</ul>' +
            '</div>';
        this.shellView.showHtmlOutput(output);
    }

    /**
     * Implementation of the "pwd" (show current directory path) command.
     * @return {string} the absolute path of the current directory.
     */
    computeCurrentPath() {
        const root = 'C:\\';
        if (this.folderStack.length > 0) {
            const path = this.folderStack
                .map((item) => item.name)
                .reduce((accumulator, currentValue) => accumulator + '\\' + currentValue);
            return `${root}${path}${this.currentDirectory.name}`;
        }
        return root;
    }
}
