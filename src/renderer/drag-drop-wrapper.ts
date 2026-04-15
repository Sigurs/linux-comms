export class DragDropWrapper {
	private dragTimer: number | null = null;
	private isDragging = false;
	private holdDuration = 1000; // 1 second
	private currentEntry: HTMLElement | null = null;
	private startX = 0;
	private startY = 0;
	private dragThreshold = 10; // pixels - how far mouse can move before canceling drag

	constructor(
		private container: HTMLElement,
		private onReorder: (fromIndex: number, toIndex: number) => void,
	) {
		this.initialize();
	}

	initialize(): void {
		this.setupDragDrop();
	}

	private setupDragDrop(): void {
		// This is a placeholder for the react-beautiful-dnd integration
		// In a real implementation, we would use React components
		// For this vanilla JS implementation, we'll use a simpler approach

		this.container.addEventListener('mousedown', (e) => {
			const target = e.target as HTMLElement;
			const entry = target.closest('.profile-entry') as HTMLElement | null;

			if (!entry) return;

			// Prevent default to avoid text selection or other unwanted behavior
			e.preventDefault();

			// Store the entry and initial mouse position for validation
			this.currentEntry = entry;
			this.startX = e.clientX;
			this.startY = e.clientY;

			// Start the drag timer
			this.dragTimer = window.setTimeout(() => {
				this.startDrag(entry);
			}, this.holdDuration);
		});

		document.addEventListener('mousemove', (e) => {
			this.handleMouseMove(e);
		});

		this.container.addEventListener('mouseup', () => {
			this.cancelDrag();
		});

		this.container.addEventListener('mouseleave', () => {
			this.cancelDrag();
		});
	}

	private startDrag(entry: HTMLElement): void {
		// Only start dragging if mouse is still over the original entry
		if (this.isDragging || !this.currentEntry) return;

		// Verify the mouse is still within the entry bounds
		const rect = entry.getBoundingClientRect();
		const mouseX = this.startX;
		const mouseY = this.startY;

		if (
			mouseX < rect.left ||
			mouseX > rect.right ||
			mouseY < rect.top ||
			mouseY > rect.bottom
		) {
			this.cancelDrag();
			return;
		}

		this.isDragging = true;
		entry.classList.add('dragging');
		entry.style.opacity = '0.7';

		// Add drag movement listeners
		document.addEventListener('mousemove', this.handleDragMove);
		document.addEventListener('mouseup', this.handleDragEnd);
	}

	private handleDragMove = (e: MouseEvent): void => {
		if (!this.isDragging) return;

		const draggingEntry = document.querySelector(
			'.profile-entry.dragging',
		) as HTMLElement;
		if (!draggingEntry) return;

		// Simple drag implementation - in a real app, use a proper drag library
		const entries = Array.from(
			this.container.querySelectorAll('.profile-entry:not(.dragging)'),
		);
		const mouseY = e.clientY;

		let insertBefore = null;

		for (const entry of entries) {
			const rect = entry.getBoundingClientRect();
			const entryCenter = rect.top + rect.height / 2;

			if (mouseY < entryCenter) {
				insertBefore = entry;
				break;
			}
		}

		if (insertBefore) {
			this.container.insertBefore(draggingEntry, insertBefore);
		} else {
			this.container.appendChild(draggingEntry);
		}
	};

	private handleDragEnd = (): void => {
		if (!this.isDragging) return;

		this.isDragging = false;
		const draggingEntry = document.querySelector(
			'.profile-entry.dragging',
		) as HTMLElement;

		if (draggingEntry) {
			draggingEntry.classList.remove('dragging');
			draggingEntry.style.opacity = '';

			// Get the new order and trigger reorder callback
			const entries = Array.from(
				this.container.querySelectorAll('.profile-entry'),
			);
			const fromIndex = Array.from(this.container.children).indexOf(
				draggingEntry,
			);
			const toIndex = entries.indexOf(draggingEntry);

			if (fromIndex !== toIndex) {
				this.onReorder(fromIndex, toIndex);
			}
		}

		// Clean up
		document.removeEventListener('mousemove', this.handleDragMove);
		document.removeEventListener('mouseup', this.handleDragEnd);
		this.hideCountdown();
	};

	private handleMouseMove(e: MouseEvent): void {
		// If we're already dragging, use different logic
		if (this.isDragging) {
			this.handleDragMove(e);
			return;
		}

		// If we're not waiting for a drag to start, ignore
		if (!this.dragTimer || !this.currentEntry) return;

		// Check if mouse has moved too far from the original position
		const dx = Math.abs(e.clientX - this.startX);
		const dy = Math.abs(e.clientY - this.startY);

		if (dx > this.dragThreshold || dy > this.dragThreshold) {
			// Mouse moved outside the threshold, cancel the drag
			this.cancelDrag();
		}
	}

	private cancelDrag(): void {
		if (this.dragTimer) {
			clearTimeout(this.dragTimer);
			this.dragTimer = null;
		}

		this.hideCountdown();
		this.currentEntry = null;

		if (this.isDragging) {
			this.isDragging = false;
			const draggingEntry = document.querySelector(
				'.profile-entry.dragging',
			) as HTMLElement;

			if (draggingEntry) {
				draggingEntry.classList.remove('dragging');
				draggingEntry.style.opacity = '';
			}

			document.removeEventListener('mousemove', this.handleDragMove);
			document.removeEventListener('mouseup', this.handleDragEnd);
		}

		// Remove the global mousemove listener
		document.removeEventListener('mousemove', this.handleMouseMove);
	}

	private hideCountdown(): void {
		// Countdown removed as per user request
	}

	cleanup(): void {
		this.cancelDrag();
		this.hideCountdown();
	}
}
