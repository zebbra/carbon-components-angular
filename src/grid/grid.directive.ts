import {
	AfterContentInit,
	ContentChildren,
	Directive,
	HostBinding,
	Input,
	OnInit,
	QueryList
} from "@angular/core";

@Directive({
	selector: "[ibmCol]"
})
export class ColumnDirective implements OnInit {
	@HostBinding("class")
	get columnClasses(): string {
		return this._columnClasses.join(" ");
	}

	set columnClasses(classes: string) {
		this._columnClasses = classes.split(" ");
	}

	@Input() class = "";

	@Input() columnNumbers = {};

	/**
	 * Offset only applies to flex grid,
	 * pass in start with the
	 */
	@Input() offsets = {};

	/**
	 * Set to `true` to use css grid column hang class
	 * This will only work when `isCss` property is set to true
	 *
	 * Useful when trying to align content across different grid modes
	 */
	@Input() columnHang = false;
	isCss = false;

	protected _columnClasses: string[] = [];

	ngOnInit() {
		// Using setTimeout to simulate a tick to capture an update isCss property
		// otherwise, isCss will always be false
		setTimeout(() => {
			try {
				const columnKeys = Object.keys(this.columnNumbers);

				// Assign classes based on the type of grid used.
				if (this.isCss) {
					// Default css grid class
					this._columnClasses.push("cds--css-grid-column");
					if (this.columnHang) {
						this._columnClasses.push("cds--grid-column-hang");
					}

					columnKeys.forEach(key => {
						/**
						 * Passing in `auto` to a breakpoint as such: {'md': 'auto'}
						 * will assign the element which will automatically determine the width of the column
						 * for the breakpoint passed
						 */
						if (this.columnNumbers[key] === "auto") {
							this._columnClasses.push(`cds--${key}:col-span-auto`);
						} else if (typeof this.columnNumbers[key] === "object") {
							/**
							 * In css grid, objects can be passed to the keys in the following format:
							 * {'md': {'start': 3}}
							 *
							 * These objects are used to position the column
							 */
							if (this.columnNumbers[key]["start"]) {
								// col-start is simular equivalent of flex offset
								this._columnClasses.push(`cds--${key}:col-start-${this.columnNumbers[key]}`);
							} else if (this.columnNumbers[key]["end"]) {
								this._columnClasses.push(`cds--${key}:col-end-${this.columnNumbers[key]}`);
							}
						} else {
							this._columnClasses.push(`cds--${key}:col-span-${this.columnNumbers[key]}`);
						}
					});
				} else {
					// Set column classes for flex grid
					if (columnKeys.length <= 0) {
						this._columnClasses.push("cds--col");
					}

					columnKeys.forEach(key => {
						if (this.columnNumbers[key] === "nobreak") {
							this._columnClasses.push(`cds--col-${key}`);
						} else {
							this._columnClasses.push(`cds--col-${key}-${this.columnNumbers[key]}`);
						}
					});

					Object.keys(this.offsets).forEach(key => {
						this._columnClasses.push(`cds--offset-${key}-${this.offsets[key]}`);
					});
				}
			} catch (err) {
				console.error(`Malformed \`offsets\` or \`columnNumbers\`: ${err}`);
			}

			/**
			 * Append the classes passed so they aren't overriden when we set the column classes
			 * from host binding
			 */
			if (this.class) {
				this._columnClasses.push(this.class);
			}
		});
	}
}

@Directive({
	selector: "[ibmRow]"
})
export class RowDirective {
	@Input() gutter = true;
	@Input() leftGutter = true;
	@Input() rightGutter = true;

	@HostBinding("class.cds--row") baseClass = true;
	@HostBinding("class.cds--row--condensed") @Input() condensed = false;
	@HostBinding("class.cds--row--narrow") @Input() narrow = false;
}

/**
 * [See demo](../../?path=/story/components-grid--basic)
 *
 * <example-url>../../iframe.html?id=components-grid--basic</example-url>
 */
@Directive({
	selector: "[ibmGrid]"
})
export class GridDirective implements AfterContentInit {

	@Input() condensed = false;
	@Input() narrow = false;
	@Input() fullWidth = false;

	/**
	 * Set to `true` to use css grid
	 */
	@Input() useCssGrid = false;

	// Flex grid
	@HostBinding("class.cds--grid") get flexGrid() {
		return !this.useCssGrid;
	}
	@HostBinding("class.cds--grid--condensed") get flexCondensed() {
		return !this.useCssGrid && this.condensed;
	}
	@HostBinding("class.cds--grid--narrow") get flexNarrow() {
		return !this.useCssGrid && this.narrow;
	}
	@HostBinding("class.cds--grid--full-width") get flexFullWidth() {
		return !this.useCssGrid && this.fullWidth;
	}

	// CSS Grid
	@HostBinding("class.cds--css-grid") get ccsGrid() {
		return this.useCssGrid && !this.isSubgrid;
	}
	@HostBinding("class.cds--css-grid--condensed") get ccsCondensed() {
		return this.useCssGrid && !this.isSubgrid && this.condensed;
	}
	@HostBinding("class.cds--css-grid--narrow") get ccsNarrow() {
		return this.useCssGrid && !this.isSubgrid && this.narrow;
	}
	@HostBinding("class.cds--css-grid--full-width") get ccsFullWidth() {
		return this.useCssGrid && !this.isSubgrid && this.fullWidth;
	}

	// CSS Sub Grid
	@HostBinding("class.cds--subgrid") get subGrid() {
		return this.useCssGrid && this.isSubgrid;
	}
	@HostBinding("class.cds--subgrid--condensed") get subCondensed() {
		return this.useCssGrid && this.isSubgrid && this.condensed;
	}
	@HostBinding("class.cds--subgrid--narrow") get subNarrow() {
		return this.useCssGrid && this.isSubgrid && this.narrow;
	}
	@HostBinding("class.cds--subgrid--wide") get subFullWidth() {
		return this.useCssGrid && this.isSubgrid && this.fullWidth;
	}

	@ContentChildren(GridDirective, { descendants: true }) cssGridChildren: QueryList<GridDirective>;
	@ContentChildren(ColumnDirective, { descendants: true }) columnChildren: QueryList<ColumnDirective>;

	private isSubgrid = false;

	ngAfterContentInit(): void {
		if (typeof this.useCssGrid !== "boolean") {
			this.useCssGrid = false;
		}

		// Update children grid & columns to use css grid classes
		if (this.useCssGrid) {
			if (this.cssGridChildren) {
				this.cssGridChildren.forEach((grid) => {
					// Prevents initial (parent) grid element from being turned into a subgrid
					if (grid === this) {
						return;
					}
					grid.useCssGrid = true;
					grid.isSubgrid = true;
				});
			}

			if (this.columnChildren) {
				this.columnChildren.forEach(column => column.isCss = true);
			}
		}
	}
}
