<template>
    <div :class="['custom-cursor', classes]"
         :style="positionStyle">
        <div class="custom-cursor__dot"></div>

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
                isTicking: false,
                isCursorVisible: true,
                isHovered: false,
                isVScroll: false,
                isHScroll: false,
                isLeft: false,
                isRight: false,
                isCompact: false,

                hoverElements: [],
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
                };
            },

            positionStyle() {
                return `transform: translate3d(${this.clientX}px, ${this.clientY}px, 0)`;
            },
        },

        mounted() {
            document.addEventListener('mousemove', this.onCursorMove);
            document.addEventListener('mouseleave', this.onCursorLeave);
            document.addEventListener('mouseenter', this.onCursorEnter);
            this.initHovers();
        },

        beforeDestroy() {
            document.removeEventListener('mousemove', this.onCursorMove);
            document.removeEventListener('mouseleave', this.onCursorLeave);
            document.removeEventListener('mouseenter', this.onCursorEnter);
        },

        methods: {

            /** Отслеживание курсора */
            detectCursor(event) {
                let cursor_x = event.clientX;
                let cursor_y = event.clientY;
                this.interpolate(this.$data, ['clientX', 'clientY'], [cursor_x, cursor_y]);
            },

            /** Интерполяция значения позиции мыши
             * @param - Объект содержащий значение
             * @param - Название значения в объекте
             * @param - Целевое значение
             */
            interpolate(object, name_object, next_object) {
                cancelAnimationFrame(this.animation);

                let progress = 0;
                /** Регулятор скорости анимации(число особого смысла не имеет) */
                const speed = 0.00000001;

                const tick = () => {
                    name_object.forEach((element, key) => {
                        object[element] += ((next_object[key] - object[element]) * 0.1) * speed;
                    });
                    progress += 0.1 * speed;
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
                const clickedElements = document.querySelectorAll('.cursor-clicked');
                const scrollElements = [...document.querySelectorAll('.cursor-v-scroll'), ...document.querySelectorAll('.cursor-h-scroll')];
                const galleryElements = [...document.querySelectorAll('.cursor-left'), ...document.querySelectorAll('.cursor-right')];

                hoverElements.forEach(item => {
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
            &:before {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.34);
            }
        }

        &.is-v-scroll,
        &.is-h-scroll {
            &:before {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        &.is-left,
        &.is-right {
            &:before {
                transform: translate(-50%, -50%) scale(1.34);
            }

            .custom-cursor__dot {
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

            &:before {
                background-color: transparent;
                backdrop-filter: blur(0);
            }
        }

        &:before {
            content: '';
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
    }

    .custom-cursor__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        z-index: 1;
        background-color: $dark-accent;
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
