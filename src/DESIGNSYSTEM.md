# Design System

Design system for Blackbird to be used as a guideline for UI/UX design.

The structure of this design system is largely copied from [Firefox's Acorn design system](https://acorn.firefox.com/latest/acorn-aRSAh0Sp).

## Table of Contents

- [Design System](#design-system)
  - [Table of Contents](#table-of-contents)
  - [Style](#style)
    - [Color](#color)
      - [Accent](#accent)
        - [primary.default](#primarydefault)
        - [primary.hover](#primaryhover)
      - [Information](#information)
        - [error](#error)
      - [Background](#background)
        - [bg.0](#bg0)
        - [bg.1](#bg1)
        - [bg.2](#bg2)
      - [Foreground](#foreground)
        - [fg.0](#fg0)
        - [fg.1](#fg1)
        - [fg.2](#fg2)
    - [Iconography](#iconography)
    - [Typography](#typography)
      - [Icons](#icons)
      - [Tokens](#tokens)
        - [Heading](#heading)
          - [Default](#default)
        - [Body](#body)
          - [Default](#default-1)
          - [Default Bold](#default-bold)
          - [Small Bold](#small-bold)
          - [Small](#small)
  - [Components](#components)
    - [Button](#button)
      - [Definition](#definition)
      - [Usage](#usage)
      - [Anatomy](#anatomy)
      - [Variants](#variants)
        - [Size](#size)
        - [States](#states)

## Style

### Color

Blackbird follows a semantic color palette system for styling its user interfaces.

#### Accent

Blackbird's primary brand accent color gives the application its distinct identity. The primary brand accent color should only be used for important actionable interface components such as:

- Primary button
- Toggle switch
- Important highlighting

##### primary.default

```text
#FFBB33
```

##### primary.hover

```text
#FFAD0A
```

#### Information

There are also colors used to represent important information such as errors.

##### error

```text
#E4004A
```

#### Background

Blackbird uses 3 layers of background colors, used to separate information on a page into stacks.

##### bg.0

```text
#0A0A0B
```

##### bg.1

```text
#131315
```

##### bg.2

```text
#1D1D20
```

#### Foreground

Blackbird uses 3 levels of foreground colors, to assist with defining a visual hierarchy. These foreground colors are primarily used for text and icon coloring, but are also used for other contexts.

##### fg.0

`fg.0` is also used as the background for important buttons, in which `bg.0` is used for the text label on the button component. It is also used as focus outline.

This color should be used on interactive components like links only when the text is focused.

```text
#F2F3F4
```

##### fg.1

This color is the default text color for Blackbird. Text elements that can be clicked should be this color until focused. It is also used for icons and scrollbars.

```text
#BFBFC3
```

##### fg.2

This color is used for disabled components and borders.

```text
#8D8A93
```

### Iconography

Blackbird uses the [Material Design Icons library from Pictogrammers](https://pictogrammers.com/libraries/) for its icons.

### Typography

The **font family** used is **Inter**.

#### Icons

Avoid placing icons alongside text to emphasize meaning, particularly in menus and buttons. Instead, opt for descriptive text that clearly communicates the function of a menu item, label or headline. For interactive elements, you can also use an icon button, but ensure it won't confuse users.

This is a general guideline, and not a hard rule. Common exceptions are:

- Favicons next to website names
- Warning icons next to captions to draw attention to errors or problems.
- As a means of distinguishing text when the other signifier is color.

#### Tokens

##### Heading

###### Default

Inter Semi Bold 600 14px

Used for headings in modals, panels, and menus

##### Body

###### Default

Inter Regular 400 14px

Used for text(paragraph) in modals, panels, menus, and inputs

###### Default Bold

Inter Regular 600 14px

Used for bold text in buttons, and bold text in modals, panels, and menus.

###### Small Bold

Inter Semi Bold 600 12px

Used for bold text in infobar and menu notifications

###### Small

Inter Regular 400 12px

Used for text (paragraph) in infobar and menu notifications

## Components

### Button

#### Definition

An interactive visual element that indicates an available action for the user.

#### Usage

Buttons are for making a change to page state, submitting, or initiating an action.

#### Anatomy

A button is broken down into 4 seperate components:

| **Key** | **Category** | **Parts** |
|---|---|---|
| 1 | **Shape** | Border radius, border color |
| 2 | **Shape** | Background color |
| 3 | **Shape** | Padding (block [top, bottom], inline [left, right]) |
| 4 | **Text** | Font family, size/line height, color |

#### Variants

There are 2 button types, with 5 different states.

##### Size

Buttons should always use the default body typography.

##### States

Available states are as follows: **default**, **hover**, **active**, **focus**, and **disabled**.

**Focus** and **disabled** states
