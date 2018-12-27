'use strict';

import '../css/main.scss';
import {ShellController} from './shell-controller';
import {ShellService} from './shell-service';

export class ShellView {
    constructor(terminalWindow) {
        this.shellController = null;
        this.terminalWindow = terminalWindow;
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';
    }

    setController(shellController) {
        this.shellController = shellController;
    }

    processGenericKeyEvent(event, func) {
        const prompt = event.target || {};
        const input = prompt.textContent.trim();
        try {
            func(input);
        } catch (e) {
            console.error(e);
            this.showError(e.message);
        }
        event.preventDefault();
        this.resetTabStatus();
    }

    processTabKeyEvent(event) {
        if (this.numberOfConsecutiveTabs === 0) {
            const prompt = event.target || {};
            this.originalInput = prompt.textContent;
        }
        this.shellController.estimateCommand(this.originalInput, this.numberOfConsecutiveTabs);
        this.numberOfConsecutiveTabs++;
        event.preventDefault();
    }

    resetTabStatus() {
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';
    }

    keyPressEvent(event) {
        switch (event.keyCode) {
            // handle TAB key event
            case 9: {
                this.processTabKeyEvent(event);
                break;
            }
            // handle ENTER key event
            case 13: {
                this.processGenericKeyEvent(event, (input) => {
                    this.shellController.processCommand(input);
                });
                this.resetPrompt(event);
                break;
            }
            // handle UP key event
            case 38: {
                this.processGenericKeyEvent(event, (input) => {
                    this.shellController.historyBefore(input);
                });
                break;
            }
            // handle DOWN key event
            case 40: {
                this.processGenericKeyEvent(event, (input) => {
                    this.shellController.historyAfter(input);
                });
                break;
            }
            default: {
                this.resetTabStatus();
            }
        }
    }

    resetPrompt(event) {
        const prompt = event.target.parentNode || {};
        const newPrompt = prompt.cloneNode(true);
        const currentPath = this.shellController.computeCurrentPath();
        const newPwd = newPrompt.querySelector('[data-js=pwd]');
        if (!!newPwd) newPwd.innerText = currentPath + '>';
        const newInput = newPrompt.querySelector('[data-js=input]');
        if (!!newInput) {
            newInput.innerHTML = '';
            prompt.setAttribute('contenteditable', false);
            this.terminalWindow.appendChild(newPrompt);
            newInput.focus();
        }
        if (!newPwd) throw Error('Could not find [data-js=pwd]!');
        if (!newInput) throw Error('Could not find [data-js=input]!');
    }

    setPrompt(command) {
        const prompts = document.querySelectorAll('[data-js=prompt]');
        if (prompts.length > 0) {
            const prompt = prompts[prompts.length - 1];
            const input = prompt.querySelector('[data-js=input]');
            if (!!input) {
                input.innerHTML = command;
                input.focus();
                // Move the cursor at the end of the text.
                const range = document.createRange();
                range.selectNodeContents(input);
                range.collapse(false);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                throw Error('Could not find [data-js=input]!')
            }
        } else {
            throw Error('Could not find [data-js=prompt]!')
        }
    }

    showHtmlOutput(output) {
        this.terminalWindow.innerHTML += (`${output} <br>`);
    }

    showOutput(output) {
        const span = document.createElement('span');
        span.innerText += output;
        this.terminalWindow.appendChild(span);
    }

    showError(errorMessage) {
        const span = document.createElement('span');
        span.classList.add('error');
        span.innerText += errorMessage;
        this.terminalWindow.appendChild(span);
    }

    clearScreen() {
        this.terminalWindow.innerHTML = '';
    }
}

const init = () => {
    const terminal = document.querySelector('[data-js=terminal]');
    const loading = document.querySelector('[data-js=loading]');

    if (!!terminal && !!loading) {
        const shellView = new ShellView(terminal);

        // Catch every keypress and handle it accordingly
        terminal.addEventListener('keydown', (event) => {
            shellView.keyPressEvent(event);
        });

        // Focus the last input whenever a click is done inside the terminal.
        terminal.addEventListener('mouseup', () => {
            const allInputs = document.querySelectorAll('[data-js=input]');
            if (allInputs.length > 0) {
                const lastInput = allInputs[allInputs.length - 1];
                lastInput.focus();
            }
        });

        const shellService = new ShellService();
        shellService.getData().then(data => {
            const shellController = new ShellController(shellView, data);
            shellView.setController(shellController);
        }).catch(() => {
            const data = {
                type: 'dir',
                astModified: '09/15/2018  02:39 PM',
                name: '',
                content: [
                    {
                        type: 'file',
                        lastModified: '12/27/2018 6:20 PM',
                        name: 'error.txt',
                        content: 'Could not retrieve data from the host. Please try again by refreshing the page.',
                        size: 6
                    },
                ]
            };
            const shellController = new ShellController(shellView, data);
            shellView.setController(shellController);
        }).finally(() => {
            loading.style.display = 'none';
        });
    }

    if (!terminal) throw new Error("Could not find [data-js=terminal]!");
    if (!loading) throw new Error("Could not find [data-js=loading]!");
};

init();