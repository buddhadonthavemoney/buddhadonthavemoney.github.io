document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.terminal');
    const terminalContent = document.querySelector('.terminal-content');
    const commandInputContainer = document.querySelector('.command-input'); // Select the container
    const commandInputField = document.getElementById('command-input-field');
    const staticContent = document.querySelector('.static-content');
    let commandHistoryContainer = null; // Initialize as null

    // Select both buttons (in case either one is present)
    const desktopToggleButton = document.getElementById('interactive-toggle-btn');
    const mobileToggleButton = document.getElementById('mobile-interactive-toggle');
    
    console.log("Desktop button:", desktopToggleButton);
    console.log("Mobile button:", mobileToggleButton);

    // --- Helper Functions ---
    function ensureHistoryContainer() {
        if (!commandHistoryContainer) {
            commandHistoryContainer = document.createElement('div');
            commandHistoryContainer.className = 'command-history';
            terminalContent.insertBefore(commandHistoryContainer, document.querySelector('.command-input'));
        }
        return commandHistoryContainer;
    }

    // Improve the scrollToBottom function to be more reliable
    function scrollToBottom(immediate = false) {
        // Function to perform the actual scrolling
        const performScroll = () => {
            // Force scroll to the absolute bottom
            if (terminalContent) {
                terminalContent.scrollTop = terminalContent.scrollHeight;
                console.log('Scrolled to bottom:', terminalContent.scrollTop, 'of', terminalContent.scrollHeight);
            }
        };
        
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(performScroll);
        
        // Then add multiple delayed scrolls to catch any delayed content rendering
        if (immediate) {
            // For immediate actions (adding commands, responses)
            setTimeout(performScroll, 10);
            setTimeout(performScroll, 50);
            setTimeout(performScroll, 150);
            setTimeout(performScroll, 300); // Additional longer timeout
        } else {
            // For non-immediate actions
            setTimeout(performScroll, 100);
            setTimeout(performScroll, 300);
        }
    }

    function addCommandToHistory(command) {
        const historyContainer = ensureHistoryContainer();
        const commandLine = document.createElement('div');
        commandLine.className = 'history-line command-line';
        commandLine.innerHTML = `<span class="prompt">buddha@nixos:~$</span> ${command}`;
        historyContainer.appendChild(commandLine);
        
        // Force scroll to bottom
        scrollToBottom(true);
    }

    function addResponseToHistory(response) {
        const historyContainer = document.querySelector('.command-history');
        if (!historyContainer) return;
        
        const responseLine = document.createElement('div');
        responseLine.className = 'response';
        
        // Always use innerHTML to properly render HTML tags
        responseLine.innerHTML = response;
        
        historyContainer.appendChild(responseLine);
        
        // Try to scroll immediately
        forceScrollToBottom();
        
        // Also try after a short delay to catch any rendering issues
        setTimeout(forceScrollToBottom, 10);
    }

    function clearTerminal() {
        if (commandHistoryContainer) {
            commandHistoryContainer.innerHTML = ''; // Clear only the history
        }
        // No need to scroll to top here, as it's cleared.
    }

    // --- Command Processing ---
    const commands = {
        'help': () => `Available commands:<br>
            - help: Show this help message<br>
            - about: Readme<br>
            - tech: Tech Readme<br>
            - contact: Show contact links<br>
            - date: Show the current date and time<br>
            - clear: Clear the terminal screen<br>
            - echo [text]: Print back the text<br>
            - cowsay [text]: Show text with a cow<br>
            - books: Goodreads<br>
            - weekday: Weekdays readme<br>
            - weekend: Weekend readme<br>
            - exit: Exit interactive mode`,

        'about': () => `I'm a Backend/DevOps Engineer working for a startup building cloud-based multi-tenant SaaS product. I love open source 
					and Linux systems (I use NixOS btw. You might know by now hahaha). Used to be a Neovim purist, but now I vibe with Cursor.`,
        'tech': () => `On the tech side, I'm fascinated by databases, self-hosting services, and homelab setups. The elegance
					of ACID-compliant systems — handling millions of updates and billions of reads in milliseconds — drives my 
					interest. I also enjoy building self-hosted solutions, from media streaming to personal cloud services, 
					optimizing for performance and reliability.`,
        'weekday': () => `I am a gym rat. Currently, I squat 110kg, bench 70kg, and deadlift 140kg — not where 
					I want to be, but getting stronger every day. Will definitely be a member of 1000lbs club one day.
                    In the very little time left in the day, I go through some hackernews and read some pages of a book.`,
        'weekend': () => `On weekends, you'll find me either on motorcycle rides exploring new places, or at a hillside cafe 
					with an americano and a good book.
					In the next few years, I plan to take my bike around the world. Reading books living on the road. 
					What else would a guy want.`,
        'books': () => `<div class="links">
            <a href="https://www.goodreads.com/user/show/157231739-buddhaa-gautam" target="_blank">
                <i class="fa fa-book"></i> Goodreads
            </a>`,

        'contact': () => `<div class="links">
            <a href="https://github.com/buddhadonthavemoney/" target="_blank">
                <i class="fab fa-github"></i> GitHub
            </a>
            <a href="https://www.linkedin.com/in/buddhagautam/" target="_blank">
                <i class="fab fa-linkedin"></i> LinkedIn
            </a>
            <a href="https://blog.buddhag.com.np" target="_blank">
                <i class="fas fa-blog"></i> Blog
            </a>
        </div>`,
        'date': () => new Date().toLocaleString(),
        'clear': () => { clearTerminal(); return null; }, // Special case for clear
        'echo': (args) => args.slice(1).join(' ') || 'Usage: echo [text]', // Pass args
        'cowsay': (args) => { // Pass args
            const text = args.slice(1).join(' ') || 'Moo!';
            return `<pre class="cowsay">< ${text} >\n    \\   ^__^\n     \\  (oo)\\_______\n        (__)\\       )\\/\\\n            ||----w |\n            ||     ||</pre>`;
        },
        'exit': () => {
            addResponseToHistory("Exiting interactive mode...");
            
            // Use setTimeout to allow the message to be visible before exit
            setTimeout(() => {
                const terminal = document.querySelector('.terminal');
                const checkbox = document.getElementById('mode-toggle-checkbox');
                
                // Exit interactive mode
                terminal.classList.remove('interactive');
                
                // Update checkbox state
                if (checkbox) {
                    checkbox.checked = false;
                }
                
                // Also update toggle button if needed
                const mobileToggleButton = document.getElementById('mobile-interactive-toggle');
                if (mobileToggleButton) {
                    mobileToggleButton.classList.remove('active');
                }
                
                // Clear terminal and scroll to top (matching existing behavior)
                clearTerminal();
                terminalContent.scrollTop = 0;
            }, 500);
            
            return null; // Don't add additional response
        }
    };

    function setupCommandInputListener() {
        // Remove any existing listeners first to avoid duplicates
        commandInputField.removeEventListener('keydown', handleCommandInput);

        // Add the event listener
        commandInputField.addEventListener('keydown', handleCommandInput);
    }

    function handleCommandInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = commandInputField.value.trim();

            if (command) {
                // Debug log to see if this is being triggered
                console.log('Processing command:', command);

                processCommand(command);
                commandInputField.value = '';

                // Focus back on input after processing
                setTimeout(() => {
                    commandInputField.focus();
                }, 10);
            }
        }
    }

    function processCommand(command) {
        console.log('Processing command:', command);
        
        // Add the command to history
        addCommandToHistory(command);
        
        const args = command.toLowerCase().trim().split(' ').filter(Boolean);
        const cmd = args[0];
        
        if (commands[cmd]) {
            const result = commands[cmd](args);
            if (result !== null) {
                addResponseToHistory(result);
            }
        } else if (command.trim()) {
            addResponseToHistory(`Command not found: ${command}. Type 'help' for available commands.`);
        }
        
        // More aggressive scroll approach with multiple attempts
        setTimeout(forceScrollToBottom, 0);
        setTimeout(forceScrollToBottom, 50);
        setTimeout(forceScrollToBottom, 100);
        setTimeout(forceScrollToBottom, 300);
    }


    // Focus input when clicking inside terminal area (but DON'T force scroll here)
    terminalContent.addEventListener('click', (event) => {
        if (terminal.classList.contains('interactive')) {
            // Check if the click target is appropriate for focusing the input
            const targetIsInput = event.target === commandInputField || commandInputField.contains(event.target);
            const targetIsHistoryArea = event.target === terminalContent || event.target === commandHistoryContainer || event.target.closest('.command-history');
            const targetIsLink = event.target.tagName === 'A' || event.target.closest('a');

            if (!targetIsInput && targetIsHistoryArea && !targetIsLink) {
                commandInputField.focus(); // Focus the input
                // REMOVED: scrollToBottom(true); - Don't force scroll just on click
            }
        }
    });

    // Scroll immediately ONLY when the input field gains focus directly
    // (This combats the browser potentially scrolling to the top on focus)
    commandInputField.addEventListener('focus', () => {
        if (terminal.classList.contains('interactive')) {
            scrollToBottom(true);
        }
    });

    // --- Initial Setup ---
    function setupInitialMode() {
        const startInteractive = false; // Keep default as false for now
        
        terminal.classList.toggle('interactive', startInteractive);
        
        // Update both buttons instead of using toggleButton
        if (desktopToggleButton) {
            desktopToggleButton.classList.toggle('active', startInteractive);
            desktopToggleButton.textContent = startInteractive ? 'Exit Interactive' : 'Enter Interactive';
        }
        
        if (mobileToggleButton) {
            mobileToggleButton.classList.toggle('active', startInteractive);
        }
        
        // Set up the command input listener
        setupCommandInputListener();
        
        if (startInteractive) {
            ensureHistoryContainer();
            addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
            
            setTimeout(() => {
                commandInputField.focus();
                scrollToBottom(true); // Force immediate scroll
            }, 100);
        }
    }

    setupInitialMode(); // Run on load

    // Use the title bar toggle button for all screen sizes
    const toggleButton = document.getElementById('mobile-interactive-toggle');
    
    console.log("Toggle button found:", toggleButton); // Debug log to verify button is found
    
    // Directly add click event to ensure it's working
    if (toggleButton) {
        console.log("Adding click event to toggle button");
        
        toggleButton.addEventListener('click', function(e) {
            console.log("Toggle button clicked"); // Debug log
            e.preventDefault(); // Prevent any default behavior
            
            const isCurrentlyInteractive = terminal.classList.contains('interactive');
            console.log("Currently interactive:", isCurrentlyInteractive);
            
            if (isCurrentlyInteractive) {
                // --- Switching FROM Interactive TO Static ---
                terminal.classList.remove('interactive');
                toggleButton.classList.remove('active');
                clearTerminal(); // Clear history
                terminalContent.scrollTop = 0; // Reset scroll for static view
            } else {
                // --- Switching FROM Static TO Interactive ---
                terminal.classList.add('interactive');
                toggleButton.classList.add('active');
                
                // Ensure history container exists
                ensureHistoryContainer();
                
                // Add welcome message
                addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
                
                // Focus and scroll with a slight delay to ensure DOM is updated
                setTimeout(() => {
                    if (commandInputField) {
                        commandInputField.focus();
                        commandInputField.disabled = false;
                    }
                    scrollToBottom(true); // Force immediate scroll
                }, 50);
            }
        });
        
        // Also add a direct onclick attribute as a backup
        toggleButton.setAttribute('onclick', "console.log('Button clicked via onclick')");
    } else {
        console.error("Toggle button not found!");
    }

    // Create a single toggle function to handle interactive mode
    function toggleInteractiveMode() {
        console.log("Toggle function called");
        const terminal = document.querySelector('.terminal');
        const checkbox = document.getElementById('mode-toggle-checkbox');
        
        // Make checkbox state match terminal state
        if (terminal.classList.contains('interactive')) {
            // --- Switching FROM Interactive TO Static ---
            terminal.classList.remove('interactive');
            checkbox.checked = false;
            
            // Rest of your existing code for exiting interactive mode
        } else {
            // --- Switching FROM Static TO Interactive ---
            terminal.classList.add('interactive');
            checkbox.checked = true;
            
            // Rest of your existing code for entering interactive mode
        }
    }
    
    // Attach the toggle function to both buttons
    if (desktopToggleButton) {
        console.log("Adding click handler to desktop button");
        desktopToggleButton.addEventListener('click', toggleInteractiveMode);
    }
    
    if (mobileToggleButton) {
        console.log("Adding click handler to mobile button");
        mobileToggleButton.addEventListener('click', toggleInteractiveMode);
        
        // Add direct onclick attribute as a fallback
        mobileToggleButton.setAttribute('onclick', "document.querySelector('.terminal').classList.toggle('interactive'); this.classList.toggle('active');");
    }

    // Add a MutationObserver to ensure scrolling when content changes
    function setupScrollObserver() {
        if (!window.scrollObserver) {
            window.scrollObserver = new MutationObserver((mutations) => {
                // Check if any mutations added nodes to the terminal content
                const contentAdded = mutations.some(mutation => 
                    mutation.type === 'childList' && mutation.addedNodes.length > 0);
                    
                if (contentAdded) {
                    // Use requestAnimationFrame for smoother scrolling
                    requestAnimationFrame(() => {
                        scrollToBottom(true);
                    });
                }
            });
            
            // Observe the terminal content for changes
            window.scrollObserver.observe(terminalContent, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: false
            });
        }
    }

    // Set up the scroll observer
    setupScrollObserver();
    
    // Also add an event listener for the input field to ensure scrolling on input
    commandInputField.addEventListener('focus', () => {
        scrollToBottom(true);
    });
    
    // Ensure scrolling when window is resized
    window.addEventListener('resize', () => {
        scrollToBottom(true);
    });

    // Add this function to your script.js file
    function forceScrollToBottom() {
        // Get the correct container to scroll
        const terminal = document.querySelector('.terminal');
        const terminalContent = document.querySelector('.terminal-content');
        const historyContainer = document.querySelector('.command-history');
        
        // Try multiple container levels to ensure at least one works
        if (historyContainer) {
            historyContainer.scrollTop = historyContainer.scrollHeight;
        }
        
        if (terminalContent) {
            terminalContent.scrollTop = terminalContent.scrollHeight;
        }
        
        if (terminal) {
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        // Log to help debug
        console.log('Force scroll executed');
    }

    // Add event listener for the checkbox
    document.getElementById('mode-toggle-checkbox').addEventListener('change', function() {
        toggleInteractiveMode();
    });

    // Update the existing cursor click handler to handle the entire command line
    const clickableCommandLine = document.getElementById('clickable-command-line');
    if (clickableCommandLine) {
        clickableCommandLine.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Only trigger if we're not already in interactive mode
            if (!terminal.classList.contains('interactive')) {
                console.log("Command line clicked, entering interactive mode");
                
                // Enter interactive mode
                terminal.classList.add('interactive');
                
                // Update checkbox state
                const checkbox = document.getElementById('mode-toggle-checkbox');
                if (checkbox) {
                    checkbox.checked = true;
                }
                
                // Toggle button appearance if needed
                const mobileToggleButton = document.getElementById('mobile-interactive-toggle');
                if (mobileToggleButton) {
                    mobileToggleButton.classList.add('active');
                }
                
                // Ensure history container exists
                ensureHistoryContainer();
                
                // Add welcome message
                addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
                
                // Focus and scroll with a slight delay to ensure DOM is updated
                setTimeout(() => {
                    if (commandInputField) {
                        commandInputField.focus();
                        commandInputField.disabled = false;
                    }
                    scrollToBottom(true); // Force immediate scroll
                }, 50);
            }
        });
    }

}); // End of DOMContentLoaded 