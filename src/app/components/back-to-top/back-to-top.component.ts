import { Component, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-back-to-top",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn btn-primary position-fixed bottom-0 start-0 m-3"
      style="z-index: 1000;"
      (click)="scrollToTop()"
      *ngIf="isVisible"
    >
      ↑ Back to Top
    </button>
  `,
  styles: [
    `
      button {
        opacity: 0.8;
        transition: opacity 0.3s;
      }

      button:hover {
        opacity: 1;
      }
    `,
  ],
})
export class BackToTopComponent {
  isVisible: boolean = false

  @HostListener("window:scroll")
  onScroll(): void {
    const scrollTop = document.documentElement.scrollTop
    this.isVisible = scrollTop > 200
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}
