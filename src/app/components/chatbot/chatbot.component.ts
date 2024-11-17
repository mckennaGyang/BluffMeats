import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <div class="chat-header" (click)="toggleChat()">
        <i class="bi bi-chat-dots"></i> Need Help?
      </div>
      <div class="chat-body" [class.open]="isOpen">
        <div class="messages" #scrollContainer>
          <div *ngFor="let message of messages" 
               [class.user-message]="message.isUser"
               [class.bot-message]="!message.isUser"
               class="message">
            <div class="message-content">
              {{message.text}}
            </div>
            <div class="message-time">
              {{message.timestamp | date:'shortTime'}}
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
          >
          <button class="btn btn-primary" (click)="sendMessage()">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
  `]
})
export class ChatbotComponent {
  messages: ChatMessage[] = [];
  currentMessage: string = '';
  isOpen: boolean = false;

  constructor() {
    this.addBotMessage('Hello! How can I help you today?');
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      this.addUserMessage(this.currentMessage);
      this.handleUserInput(this.currentMessage);
      this.currentMessage = '';
    }
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string) {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
  }

  private handleUserInput(message: string) {
    // Simple response logic - can be expanded with more sophisticated AI/ML
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      this.addBotMessage('Hello! How can I assist you today?');
    } else if (lowerMessage.includes('help')) {
      this.addBotMessage('I can help you with: \n- Finding products\n- Checking order status\n- Account management\nWhat do you need help with?');
    } else if (lowerMessage.includes('order')) {
      this.addBotMessage('To check your order status, please go to your account page and click on "Order History".');
    } else {
      this.addBotMessage('I\'m not sure I understand. Could you please rephrase that or ask something else?');
    }
  }
}