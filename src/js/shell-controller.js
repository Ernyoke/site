'use strict';

import {formatNumber, whiteSpace} from './utils'
import {LinkedList} from "./linked-list";

const CONTENT_TYPE = {
    FILE: 'file',
    DIR: 'dir'
};

const COMMAND = {
    EMPTY: '',
    DIR: 'dir',
    CD: 'cd',
    TYPE: 'type',
    CLS: 'cls',
    HELP: 'help'
};

export class ShellController {
    constructor(shellView, data) {
        this.shellView = shellView;
        this.currentDirectory = data;
        this.folderStack = [];
        this.commandMap = new Map([
            [COMMAND.EMPTY, {
                run: () => undefined
            }],
            [COMMAND.DIR, {
                run: () => this.listContent(),
            }],
            [COMMAND.CD, {
                run: (args) => this.changeDirectory(args),
                argType: CONTENT_TYPE.DIR
            }],
            [COMMAND.TYPE, {
                run: (args) => this.cat(args),
                argType: CONTENT_TYPE.FILE
            }],
            [COMMAND.CLS, {
                run: () => this.clearScreen()
            }],
            [COMMAND.HELP, {
                run: () => this.help()
            }]
        ]);
        this.history = new LinkedList();
    }

    processCommand(input) {
        const words = input.trim().toLowerCase().split(' ');
        let command = '';
        let args = [];
        if (words.length > 0) {
            command = words[0];
            args.push(...words.slice(1));
            this.parseCommand(command, args);
        }
    }

    estimateCommand(input, position) {
        if (!!input && input.match(/^([a-z]|[A-Z]).* */).length > 0) {
            const [cmd, args] = input.toLowerCase().split(/\s(.+)/);
            if (this.commandMap.has(cmd)) {
                const eligibleContent = this.currentDirectory.content.filter(item => {
                    return item.type === this.commandMap.get(cmd).argType && item.name.startsWith(args);
                });
                if (eligibleContent.length > 0) {
                    let normalPosition = position % eligibleContent.length;
                    this.shellView.setPrompt(`${cmd} ${eligibleContent[normalPosition].name}`);
                }
            }
        }
    }

    parseCommand(command, args) {
        if (this.commandMap.has(command)) {
            this.commandMap.get(command).run(args);
            this.history.last = [command, args];
        } else {
            throw Error('Nonexistent command!');
        }
    }

    historyBefore() {
        const commandWithArguments = this.history.navigateBackward();
        if (!!commandWithArguments) {
            const prompt = commandWithArguments.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue);
            this.shellView.setPrompt(prompt);
        }
    }

    historyAfter() {
        const commandWithArguments = this.history.navigateForward();
        if (!!commandWithArguments) {
            const prompt = commandWithArguments.reduce((accumulator, currentValue) => accumulator + ' ' + currentValue);
            this.shellView.setPrompt(prompt);
        }
    }

    // dir
    listContent() {
        let content = this.currentDirectory.content;
        let output = '<div>' +
            '<div><span>Directory of ' + this.computeCurrentPath() + '</span></div>';
        let sumFileSizes = 0;
        let countNumberOfFiles = 0;
        let countNumberOfDirectories = 0;
        for (let item of content) {
            let type, size;
            if (item.type === CONTENT_TYPE.DIR) {
                type = '&nbsp&nbsp&lt;DIR&gt;';
                size = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                countNumberOfDirectories++
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

    // type [FILE]
    cat(arg) {
        if (arg.length > 0) {
            let filename = arg[0].trim();
            let files = this.currentDirectory.content.filter((item) => {
                return item.name === filename && item.type === CONTENT_TYPE.FILE;
            });
            if (files < 1) {
                throw Error(`File with the name ${filename} of does not exist!`);
            } else {
                this.shellView.showHtmlOutput(files[0].content);
            }
        } else {
            throw Error('Missing argument from command "type"! Usage: type [FILENAME]')
        }
    }

    // cd [DIR]
    changeDirectory(arg) {
        if (arg.length > 0) {
            let directoryName = arg[0].trim();
            if (directoryName === '..') {
                if (this.folderStack.length > 0) {
                    this.currentDirectory = this.folderStack.pop();
                }
            } else {
                let dirs = this.currentDirectory.content.filter((item) => {
                    return item.name === directoryName && item.type === CONTENT_TYPE.DIR;
                });
                if (dirs.length < 1) {
                    throw Error(`Directory with the name ${directoryName} of does not exist!`);
                } else {
                    this.folderStack.push(this.currentDirectory);
                    this.currentDirectory = dirs[0];
                }
            }
        } else {
            throw Error('Missing argument from command "cd"! Usage: cd [DIRNAME]')
        }
    }

    // cls
    clearScreen() {
        this.shellView.clearScreen();
    }

    // help
    help() {
        let output = '<div>Available commands: dir, type, cd, help.' +
            '<ul>' +
            '<li>dir: List the content of the current directory. Equivalent of "ls" commend under Unix systems.</li>' +
            '<li>type: Show the content of a file. Equivalent of "cat" commend under Unix systems. Usage: type [FILENAME]</li>' +
            '<li>cd: Navigate into a selected directory. Usage: cd [DIRNAME]. To navigate up: cd ..  </li>' +
            '<li>clear: Clear the current terminal input screen.  </li>' +
            '</ul>' +
            '</div>';
        this.shellView.showHtmlOutput(output);
    }

    // pwd
    computeCurrentPath() {
        let pwd = 'C:\\';
        if (this.folderStack.length > 0) {
            return pwd + this.folderStack
                    .map(item => item.name)
                    .reduce((accumulator, currentValue) => accumulator + '\\' + currentValue) +
                this.currentDirectory.name;
        }
        return pwd;
    }
}