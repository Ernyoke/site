'use strict';

import '../css/main.scss';
import {ShellController} from './shell-controller';
import {ShellService} from './shell-service';

/**
 * Implementation of the View (MVC) for the terminal window.
 */
export class ShellView {
    /**
     *
     * @param {Element} terminalHeader
     * @param {Element} terminalBody
     * @param {Element} terminal
     */
    constructor(terminalHeader, terminalBody, terminal) {
        this.shellController = null;
        this.terminalHeader = terminalHeader;
        this.terminalBody = terminalBody;
        this.termial = terminal;
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';

        this.makeTerminalDraggable();
    }

    /**
     * Setter method to be able to inject the controller class.
     * @param {ShellController} shellController
     */
    setController(shellController) {
        this.shellController = shellController;
    }

    /**
     * Process keyboard events.
     * @param {EventListenerOrEventListenerObject} event -  event generated after the keypress.
     * @param {function} func -  callback function which should be executed after the event is processed.
     */
    processGenericKeyEvent(event, func) {
        const prompt = event.target || {};
        const input = prompt.textContent.trim();
        try {
            func(input);
        } catch (e) {
            this.showError(e.message);
        }
        event.preventDefault();
        this.resetTabStatus();
    }

    /**
     * Process Tab key event.
     * @param {EventListenerOrEventListenerObject} event -  event generated after the keypress.
     */
    processTabKeyEvent(event) {
        if (this.numberOfConsecutiveTabs === 0) {
            const prompt = event.target || {};
            this.originalInput = prompt.textContent;
        }
        this.shellController.estimateCommand(this.originalInput, this.numberOfConsecutiveTabs);
        this.numberOfConsecutiveTabs++;
        event.preventDefault();
    }

    /**
     * Reset the counter which holds how many times was the Tab key pressed. Resets the original input text.
     */
    resetTabStatus() {
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';
    }

    /**
     * Process generic key events.
     * @param {EventListenerOrEventListenerObject} event - event generated after the keypress.
     */
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

    /**
     *
     * @param {EventListenerOrEventListenerObject} event
     */
    resetPrompt(event) {
        const prompt = event.target.parentNode || {};
        const newPrompt = prompt.cloneNode(true);
        const currentPath = this.shellController.computeCurrentPath();
        const newPwd = newPrompt.querySelector('[data-js=prompt-pwd]');
        if (newPwd) newPwd.innerText = currentPath + '>';
        const newInput = newPrompt.querySelector('[data-js=prompt-input]');
        if (newInput) {
            newInput.innerHTML = '';
            prompt.setAttribute('contenteditable', false);
            this.terminalBody.appendChild(newPrompt);
            newInput.focus();
        }
        if (!newPwd) throw Error('Could not find [data-js=pwd]!');
        if (!newInput) throw Error('Could not find [data-js=prompt-input]!');
    }

    /**
     *
     * @param {string} command
     */
    setPrompt(command) {
        const prompts = document.querySelectorAll('[data-js=prompt]');
        if (prompts.length > 0) {
            const prompt = prompts[prompts.length - 1];
            const input = prompt.querySelector('[data-js=prompt-input]');
            if (input) {
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
                throw Error('Could not find [data-js=input]!');
            }
        } else {
            throw Error('Could not find [data-js=prompt]!');
        }
    }

    /**
     * Display output string as HTML inside the terminal window.
     * @param {string} output -  string with HTML content
     */
    showHtmlOutput(output) {
        this.terminalBody.innerHTML += (`${output} <br>`);
    }

    /**
     * Display output as text inside the terminal window.
     * @param {string} output -  text to be displayed
     */
    showOutput(output) {
        const span = document.createElement('span');
        span.innerText += output;
        this.terminalBody.appendChild(span);
    }

    /**
     * Display string as error inside the terminal window.
     * @param {string} errorMessage -  text to be displayed.
     */
    showError(errorMessage) {
        const div = document.createElement('div');
        const span = document.createElement('span');
        span.classList.add('body__error');
        span.innerText += errorMessage;
        div.appendChild(span);
        this.terminalBody.appendChild(div);
        this.terminalBody.appendChild(document.createElement('br'));
    }

    /**
     * Clears the terminal window.
     */
    clearScreen() {
        this.terminalBody.innerHTML = '';
    }

    /**
     * Makes the terminal dialog draggable.
     */
    makeTerminalDraggable() {
        let newPositionX = 0;
        let newPositionY = 0;
        let initialPositionX = 0;
        let initialPositionY = 0;
        this.terminalHeader.onmousedown = (e) => {
            e = e || window.event;
            e.preventDefault();
            initialPositionX = e.clientX;
            initialPositionY = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };

        const elementDrag = (e) => {
            e = e || window.event;
            e.preventDefault();
            newPositionX = initialPositionX - e.clientX;
            newPositionY = initialPositionY - e.clientY;
            initialPositionX = e.clientX;
            initialPositionY = e.clientY;
            this.termial.style.top = (this.termial.offsetTop - newPositionY) + 'px';
            this.termial.style.left = (this.termial.offsetLeft - newPositionX) + 'px';
        };

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
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
                    throw new Error('Could not find [data-js=prompt-input]!');
                }
            });

            const shellService = new ShellService();
            shellService.getData().then((data) => {
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
                            size: 6,
                        },
                    ],
                };
                const shellController = new ShellController(shellView, data);
                shellView.setController(shellController);
            }).finally(() => {
                loading.style.display = 'none';
            });
        }
        if (!terminalHeader) throw new Error('Could not find [data-js=terminal-header]!');
        if (!terminalBody) throw new Error('Could not find [data-js=terminal-body]!');
    }

    if (!terminal) throw new Error('Could not find [data-js=terminal]!');
    if (!loading) throw new Error('Could not find [data-js=loading]!');
};

init();
