'use strict';

import '../css/main.scss';
import {ShellController} from './shell-controller';
import {ShellService} from './shell-service';

export class ShellView {
    constructor(terminalHeader, terminalBody, terminal) {
        this.shellController = null;
        this.terminalHeader = terminalHeader;
        this.terminalBody = terminalBody;
        this.termial = terminal;
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';

        this.makeTerminalDraggable();
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
        const newPwd = newPrompt.querySelector('[data-js=prompt-pwd]');
        if (!!newPwd) newPwd.innerText = currentPath + '>';
        const newInput = newPrompt.querySelector('[data-js=prompt-input]');
        if (!!newInput) {
            newInput.innerHTML = '';
            prompt.setAttribute('contenteditable', false);
            this.terminalBody.appendChild(newPrompt);
            newInput.focus();
        }
        if (!newPwd) throw Error('Could not find [data-js=pwd]!');
        if (!newInput) throw Error('Could not find [data-js=prompt-input]!');
    }

    setPrompt(command) {
        const prompts = document.querySelectorAll('[data-js=prompt]');
        if (prompts.length > 0) {
            const prompt = prompts[prompts.length - 1];
            const input = prompt.querySelector('[data-js=prompt-input]');
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
        this.terminalBody.innerHTML += (`${output} <br>`);
    }

    showOutput(output) {
        const span = document.createElement('span');
        span.innerText += output;
        this.terminalBody.appendChild(span);
    }

    showError(errorMessage) {
        const span = document.createElement('span');
        span.classList.add('body__error');
        span.innerText += errorMessage;
        this.terminalBody.appendChild(span);
    }

    clearScreen() {
        this.terminalBody.innerHTML = '';
    }

    makeTerminalDraggable() {
        let pos1 = 0;
        let pos2 = 0;
        let pos3 = 0;
        let pos4 = 0;
        this.terminalHeader.onmousedown = (e) => {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        };

        const elementDrag = (e) => {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            this.termial.style.top = (this.termial.offsetTop - pos2) + "px";
            this.termial.style.left = (this.termial.offsetLeft - pos1) + "px";
            console.log("TOP:", this.termial.style.top);
            console.log("LEFT:", this.termial.style.left);
        };

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

const init = () => {
    const terminal = document.querySelector('[data-js=terminal]');
    const loading = document.querySelector('[data-js=loading]');

    if (!!terminal && !!loading) {
        const terminalHeader = terminal.querySelector('[data-js=terminal-header]');
        const terminalBody = terminal.querySelector('[data-js=terminal-body]');

        if (!!terminalHeader && !!terminalBody) {
            const shellView = new ShellView(terminalHeader, terminalBody, terminal);

            // Catch every keypress and handle it accordingly
            terminal.addEventListener('keydown', (event) => {
                shellView.keyPressEvent(event);
            });


            // Focus the last input whenever a click is done inside the terminal.
            terminal.addEventListener('mouseup', () => {
                const allInputs = document.querySelectorAll('[data-js=prompt-input]');
                if (allInputs.length > 0) {
                    const lastInput = allInputs[allInputs.length - 1];
                    lastInput.focus();
                } else {
                    throw new Error("Could not find [data-js=prompt-input]!");
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
        if (!terminalHeader) throw new Error("Could not find [data-js=terminal-header]!");
        if (!terminalBody) throw new Error("Could not find [data-js=terminal-body]!");
    }

    if (!terminal) throw new Error("Could not find [data-js=terminal]!");
    if (!loading) throw new Error("Could not find [data-js=loading]!");
};

init();
