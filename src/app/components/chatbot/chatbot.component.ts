import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"
import { Item } from "../../models/item.model"

interface ChatMessage {
  text: string
  isUser: boolean
  timestamp: Date
  items?: Item[]
}

@Component({
  selector: "app-chatbot",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <div class="chat-header" (click)="toggleChat()">
        <i class="bi bi-chat-dots"></i> Need Help?
      </div>
      <div class="chat-body" [class.open]="isOpen">
        <div class="messages" #scrollContainer>
          <div
            *ngFor="let message of messages"
            [class.user-message]="message.isUser"
            [class.bot-message]="!message.isUser"
            class="message"
          >
            <div
              class="message-content"
              [innerHTML]="formatMessageText(message.text)"
            ></div>
            <div *ngIf="message.items" class="product-cards">
              <div *ngFor="let item of message.items" class="product-card">
                <img [src]="item.image_url" alt="{{ item.name }}" />
                <div class="product-details">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.description }}</p>
                  <p>Price: {{ item.price | currency }}</p>
                  <p>Category: {{ item.category }}</p>
                  <p>Stock: {{ item.stock_level }}</p>
                </div>
              </div>
            </div>
            <div class="message-time">
              {{ message.timestamp | date : "shortTime" }}
            </div>
          </div>
        </div>
        <div class="input-area">
          <input
            type="text"
            class="form-control"
            [(ngModel)]="currentMessage"
            (keyup.enter)="sendMessage()"
            placeholder="Type your message..."
          />
          <button class="btn btn-primary" (click)="sendMessage()">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        z-index: 1000;
      }
      .chat-header {
        background: #007bff;
        color: white;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
      }
      .chat-body {
        display: none;
        background: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-top: 10px;
        height: 400px;
      }
      .chat-body.open {
        display: flex;
        flex-direction: column;
      }
      .messages {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
      }
      .message {
        margin: 5px 0;
        padding: 8px 12px;
        border-radius: 15px;
        max-width: 80%;
      }
      .user-message {
        background: #007bff;
        color: white;
        margin-left: auto;
      }
      .bot-message {
        background: #f1f1f1;
      }
      .input-area {
        display: flex;
        padding: 10px;
        gap: 5px;
        border-top: 1px solid #ddd;
      }
      .message-time {
        font-size: 0.8em;
        opacity: 0.7;
      }
      .message-content {
        white-space: pre-wrap;
      }
      .product-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
      }
      .product-card {
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        width: 100%;
        display: flex;
        align-items: center;
      }
      .product-card img {
        max-width: 100px;
        max-height: 100px;
        margin-right: 10px;
      }
      .product-details {
        flex-grow: 1;
      }
    `,
  ],
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = []
  currentMessage: string = ""
  isOpen: boolean = false
  items: Item[] = []

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Load items when component initializes
    this.loadItems()
    this.addBotMessage(
      "Hello! How can I help you today? Type 'help' to see available assistance."
    )
  }

  loadItems() {
    this.apiService.getItems().subscribe((response: any) => {
      this.items = response.records.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        stock_level: parseInt(item.stock_level),
        category: item.category,
        imageUrl: item.image_url,
      }))
    })
  }

  formatMessageText(text: string): string {
    return text.replace(/\n/g, "<br>")
  }

  toggleChat() {
    this.isOpen = !this.isOpen
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      this.addUserMessage(this.currentMessage)
      this.handleUserInput(this.currentMessage)
      this.currentMessage = ""
    }
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date(),
    })
  }

  private addBotMessage(text: string, items?: Item[]) {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date(),
      items: items,
    })
  }

  private handleUserInput(message: string) {
    const lowerMessage = message.toLowerCase().trim()

    // Navigation help
    if (lowerMessage.includes("navigate") || lowerMessage.includes("go to")) {
      this.handleNavigation(lowerMessage)
      return
    }

    // Login/Authentication help
    if (lowerMessage.includes("login") || lowerMessage.includes("sign in")) {
      this.handleLoginHelp(lowerMessage)
      return
    }

    // Logout help
    if (lowerMessage.includes("logout") || lowerMessage.includes("sign out")) {
      this.handleLogoutHelp()
      return
    }

    // Registration help
    if (lowerMessage.includes("register") || lowerMessage.includes("signup")) {
      this.handleRegistrationHelp()
      return
    }

    // Item lookup
    if (lowerMessage.includes("find") || lowerMessage.includes("search")) {
      this.handleItemLookup(lowerMessage)
      return
    }

    // General help
    if (lowerMessage.includes("help")) {
      this.addBotMessage(
        "I can help you with:\n" +
          " -Navigating the store\n" +
          " -Finding products\n" +
          " -Logging in/out\n" +
          " -Registering an account\n" +
          " -Checking order status\n" +
          "What do you need help with?"
      )
      return
    }

    // Fallback response
    this.addBotMessage(
      "I'm not sure I understand. Could you please rephrase that or ask something else? Type 'help' for available options."
    )
  }

  private handleNavigation(message: string) {
    if (message.includes("store") || message.includes("homepage")) {
      this.router.navigate(["/"])
      this.addBotMessage("Navigating to the store homepage.")
    } else if (message.includes("cart")) {
      this.router.navigate(["/cart"])
      this.addBotMessage("Navigating to your cart.")
    } else if (message.includes("login")) {
      this.router.navigate(["/login"])
      this.addBotMessage("Navigating to the login page.")
    } else if (message.includes("register")) {
      this.router.navigate(["/register"])
      this.addBotMessage("Navigating to the registration page.")
    } else {
      this.addBotMessage(
        "I can help you navigate to:\n" +
          " -Store homepage\n" +
          " -Shopping cart\n" +
          " -Login page\n" +
          " -Registration page"
      )
    }
  }

  private handleLoginHelp(message: string) {
    this.addBotMessage(
      "To log in:\n" +
        " 1. Go to the login page\n" +
        " 2. Enter your email and password\n" +
        " 3. Click 'Login'\n\n" +
        "Need help? I can navigate you to the login page."
    )
    this.router.navigate(["/login"])
  }

  private handleLogoutHelp() {
    const user = localStorage.getItem("currentUser")
    if (user) {
      this.authService.logout()
      this.addBotMessage("You have been logged out successfully.")
      this.router.navigate(["/login"])
    } else {
      this.addBotMessage("You are not currently logged in.")
    }
  }

  private handleRegistrationHelp() {
    this.addBotMessage(
      "To register a new account:\n" +
        " 1. Go to the registration page\n" +
        " 2. Fill in your details\n" +
        " 3. Click 'Register'\n\n" +
        "Need help? I can navigate you to the registration page."
    )
    this.router.navigate(["/register"])
  }

  private handleItemLookup(message: string) {
    // Extract potential search term
    const searchTerm = message.replace(/find|search|for/g, "").trim()

    // Filter items based on search term
    const matchedItems = this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
    )

    if (matchedItems.length > 0) {
      this.addBotMessage(
        `Found ${matchedItems.length} item(s) matching "${searchTerm}":`,
        matchedItems
      )
    } else {
      this.addBotMessage(
        `No items found matching "${searchTerm}". Try a different search term.`
      )
    }
  }
}
