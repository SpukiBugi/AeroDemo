<template>
    <div>
        <div :class="['custom-cursor', classes]"
            :style="positionStyle">
            <div class="custom-cursor__circle"></div>

            <transition name="fade">
                <div v-if="isHScroll || isVScroll"
                    :class="isHScroll ? 'custom-cursor__arrows--horizontal' : ''"
                    class="custom-cursor__arrows">
                    <IconCursorArrow />
                    <IconCursorArrow />
                </div>
            </transition>

            <transition name="fade">
                <div v-if="isLeft || isRight"
                    class="custom-cursor__arrow">
                    <IconArrow />
                </div>
            </transition>

            <transition name="fade">
                <div v-if="isLeft || isRight"
                    class="custom-cursor__arrow">
                    <IconArrow />
                </div>
            </transition>

            <transition name="fade">
                <div v-if="isResize"
                    class="custom-cursor__arrow">
                    <IconResize />
                </div>
            </transition>
        </div>
        
        <div class="custom-cursor__dot" :style="dotStyle"></div>
    </div>
</template>

<script>
    import IconCursorArrow from '../icons/IconCursorArrow';
    import IconArrow from '../icons/IconArrow';

    export default {
        components: {
            IconArrow,
            IconCursorArrow,
        },

        data() {
            return {
                clientX: -100,
                clientY: -100,
                circleX: -100,
                circleY: -100,
                isTicking: false,
                isCursorVisible: true,
                isHovered: false,
                isResize: false,
                isVScroll: false,
                isHScroll: false,
                isLeft: false,
                isRight: false,
                isCompact: false,

                hoverElements: [],
                resizeElements: [],
                vScrollElements: [],
                clickedElements: [],
                galleryElements: [],
            };
        },

        computed: {
            classes() {
                return {
                    'is-visible': this.isCursorVisible,
                    'is-hovered': this.isHovered,
                    'is-v-scroll': this.isVScroll,
                    'is-h-scroll': this.isHScroll,
                    'is-left': this.isLeft,
                    'is-right': this.isRight,
                    'is-compact': this.isCompact,
                    'is-resize': this.isResize,
                };
            },

            positionStyle() {
                return `transform: translate3d(${this.circleX}px, ${this.circleY}px, 0)`;
            },

            dotStyle() {
                return `transform: translate3d(${this.clientX}px, ${this.clientY}px, 0)`;
            },
        },

        mounted() {
            document.addEventListener('mousemove', this.detectCursor);
            document.addEventListener('mouseleave', this.onCursorLeave);
            document.addEventListener('mouseenter', this.onCursorEnter);
            this.initHovers();
        },

        beforeDestroy() {
            document.removeEventListener('mousemove', this.detectCursor);
            document.removeEventListener('mouseleave', this.onCursorLeave);
            document.removeEventListener('mouseenter', this.onCursorEnter);
        },

        methods: {
            detectCursor(event) {
                if (this.circleX === -100 || this.circleY === -100) {
                    this.circleX = event.clientX;
                    this.circleY = event.clientY;
                }

                this.clientX = event.clientX;
                this.clientY = event.clientY;
                let cursor_x = event.clientX;
                let cursor_y = event.clientY;
                this.interpolate(this.$data, ['circleX', 'circleY'], [cursor_x, cursor_y]);
            },

            /** Интерполяция значения позиции мыши
             * @param - Объект содержащий значение
             * @param - Названия значений в объекте
             * @param - Целевые значения
             */
            interpolate(object, name_array, target_array) {
                cancelAnimationFrame(this.animation);

                let progress = 0;
                /** Регулятор скорости анимации(число особого смысла не имеет) */
                const speed = 0.3;

                const start_array = [];

                name_array.forEach(element => {
                    start_array.push(object[element]);
                });

                function easeOutSine(x) {
                    return Math.sin((x * Math.PI) / 2);
                }

                const tick = () => {
                    let step = 0.1 * speed;
                    let ease = easeOutSine(progress);

                    progress += step;

                    name_array.forEach((element, key) => {
                        object[element] = start_array[key] + (target_array[key] - start_array[key]) * ease;
                    });

                    if (progress < 1) {
                        this.animation = requestAnimationFrame(tick);
                    }
                };

                tick();
            },
            render(e) {
                this.clientX = e.clientX;
                this.clientY = e.clientY;
                this.isTicking = false;
            },

            onCursorMove(e) {
                if (!this.isTicking) {
                    this.isTicking = true;
                    requestAnimationFrame(() => {
                        this.render(e);
                    });
                }
            },

            onCursorEnter() {
                this.isCursorVisible = true;
            },

            onCursorLeave() {
                this.isCursorVisible = false;
            },

            initHovers() {
                this.addListeners();

                setInterval(() => {
                    this.removeListeners();
                    this.addListeners();
                }, 500);
            },

            removeListeners() {
                this.hoverElements.forEach(item => {
                    item.removeEventListener('mouseenter', this.handleMouseEnter);
                    item.removeEventListener('mouseleave', this.handleMouseLeave);
                });
                this.scrollElements.forEach(item => {
                    item.removeEventListener('mouseenter', this.handleMouseScrollEnter);
                    item.removeEventListener('mouseleave', this.handleMouseLeave);
                });
                this.clickedElements.forEach(item => {
                    item.removeEventListener('click', this.handleMouseLeave);
                });
                this.galleryElements.forEach(item => {
                    item.removeEventListener('mouseenter', this.handleMouseEnter);
                    item.removeEventListener('mouseleave', this.handleMouseLeave);
                });
            },

            addListeners() {
                const hoverElements = [
                    ...document.querySelectorAll('.cursor-pointer'),
                    ...document.querySelectorAll('.cursor-compact')
                ];
                const resizeElements = document.querySelectorAll('.cursor-resize');
                const clickedElements = document.querySelectorAll('.cursor-clicked');
                const scrollElements = [...document.querySelectorAll('.cursor-v-scroll'), ...document.querySelectorAll('.cursor-h-scroll')];
                const galleryElements = [...document.querySelectorAll('.cursor-left'), ...document.querySelectorAll('.cursor-right')];

                hoverElements.forEach(item => {
                    item.addEventListener('mouseenter', this.handleMouseEnter);
                    item.addEventListener('mouseleave', this.handleMouseLeave);
                });
                resizeElements.forEach(item => {
                    item.addEventListener('mouseenter', this.handleMouseEnter);
                    item.addEventListener('mouseleave', this.handleMouseLeave);
                });
                scrollElements.forEach(item => {
                    item.addEventListener('mouseenter', this.handleMouseScrollEnter);
                    item.addEventListener('mouseleave', this.handleMouseLeave);
                });
                clickedElements.forEach(item => {
                    item.addEventListener('click', this.handleMouseLeave);
                });
                galleryElements.forEach(item => {
                    item.addEventListener('mouseenter', this.handleMouseEnter);
                    item.addEventListener('mouseleave', this.handleMouseLeave);
                });

                this.hoverElements = hoverElements;
                this.resizeElements = resizeElements;
                this.scrollElements = scrollElements;
                this.clickedElements = clickedElements;
                this.galleryElements = galleryElements;
            },

            handleMouseScrollEnter(e) {
                [...e.target.classList].forEach(cls => {
                    switch (cls) {
                        case 'cursor-h-scroll':
                            this.isHScroll = true;
                            break;
                        case 'cursor-v-scroll':
                            this.isVScroll = true;
                    }
                });
            },

            handleMouseEnter(e) {
                [...e.target.classList].forEach(cls => {
                    switch (cls) {
                        case 'cursor-compact':
                            this.isHovered = false;
                            this.isCompact = true;
                            break;
                        case 'cursor-resize':
                            this.isResize;
                            this.isHovered = true;
                            break;
                        case 'cursor-left':
                            this.isLeft = true;
                            this.isRight = false;
                            this.isHovered = true;
                            break;
                        case 'cursor-right':
                            this.isLeft = false;
                            this.isRight = true;
                            this.isHovered = true;
                            break;
                        default:
                            this.isHovered = true;
                    }
                });
            },

            handleMouseLeave(e) {
                if (!this.isCompact) {
                    this.isHovered = false;
                }
                this.isVScroll = false;
                this.isHScroll = false;
                this.isLeft = false;
                this.isRight = false;
                this.isCompact = false;
                this.isResize = false;
            },
        },
    };
</script>

<style lang="scss">
    .custom-cursor {
        position: fixed;
        top: -22px;
        left: -22px;
        z-index: 101;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        opacity: 0;
        border-radius: 50%;
        cursor: none;
        pointer-events: none;
        border: 1px solid rgba($dark-accent, 0.2);
        transition: border 0.4s ease-in-out;

        &.is-hovered,
        &.is-v-scroll,
        &.is-h-scroll {
            border-color: transparent;
        }

        &.is-visible {
            opacity: 1;
        }

        &.is-hovered {
            .custom-cursor__circle {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.34);
            }
        }

        &.is-v-scroll,
        &.is-h-scroll {
            .custom-cursor__circle {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        &.is-left,
        &.is-right {
            .custom-cursor__circle {
                transform: translate(-50%, -50%) scale(1.34);
            }

            & > .custom-cursor__dot {
                opacity: 0;
            }
        }

        &.is-left {
            //
        }

        &.is-right {
            .custom-cursor__arrow {
                transform: rotate(180deg);
            }
        }

        &.is-compact {
            border: 1px solid rgba($dark-accent, 0);

            .custom-cursor__circle {
                background-color: transparent;
                backdrop-filter: blur(0);
            }
        }
    }

    .custom-cursor__dot {
        position: fixed;
        top: -3px;
        left: -3px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        z-index: 101;
        background-color: $dark-accent;
        pointer-events: none;
    }

    .custom-cursor__circle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%) scale(1);
        border-radius: 50%;
        opacity: 0;
        will-change: transform, opacity;
        transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out, background-color 0.4s ease-in-out, backdrop-filter 0.4s ease-in-out;
        backdrop-filter: blur(4px);
        background-color: rgba($dark-accent, 0.2);
    }

    .custom-cursor__arrows {
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 68px;

        & svg {
            width: 8px;
            height: 5px;

            &:first-child {
                transform: rotate(180deg);
                transform-origin: center;
            }

            fill: currentColor;
        }

        &--horizontal {
            transform: rotate(90deg);
        }
    }

    .custom-cursor__arrow {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;

        & svg {
            fill: currentColor;
        }
    }
</style>
