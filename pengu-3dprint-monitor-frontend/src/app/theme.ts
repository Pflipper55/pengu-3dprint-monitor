import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

export const AppTheme = definePreset(Aura, {
  primitive: {
    customPrimary: {
      DEFAULT: '#00A676',
      '500': '#00A676',
    },
    customSecondary: {
      DEFAULT: '#222222',
      '500': '#222222',
    },
    customSurface: {
      DEFAULT: '#FFFFFF',
      '500': '#FFFFFF',
    },
  },
  semantic: {
    primary: {
      50: '{customPrimary.DEFAULT}',
      100: '{customPrimary.DEFAULT}',
      200: '{customPrimary.DEFAULT}',
      300: '{customPrimary.DEFAULT}',
      400: '{customPrimary.DEFAULT}',
      500: '{customPrimary.DEFAULT}',
      600: '{customPrimary.DEFAULT}',
      700: '{customPrimary.DEFAULT}',
      800: '{customPrimary.DEFAULT}',
      900: '{customPrimary.DEFAULT}',
    },
    secondary: {
      50: '{customSecondary.DEFAULT}',
      100: '{customSecondary.DEFAULT}',
      200: '{customSecondary.DEFAULT}',
      300: '{customSecondary.DEFAULT}',
      400: '{customSecondary.DEFAULT}',
      500: '{customSecondary.DEFAULT}',
      600: '{customSecondary.DEFAULT}',
      700: '{customSecondary.DEFAULT}',
      800: '{customSecondary.DEFAULT}',
      900: '{customSecondary.DEFAULT}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{customPrimary.DEFAULT}',
          contrastColor: '#ffffff',
          hoverColor: '{customPrimary.DEFAULT}',
          activeColor: '{customPrimary.DEFAULT}',
        },
        secondary: {
          color: '{customSecondary.DEFAULT}',
          contrastColor: '#000000',
          hoverColor: '{customSecondary.DEFAULT}',
          activeColor: '{customSecondary.DEFAULT}',
        },
      },
      dark: {
        primary: {
          color: '{customPrimary.DEFAULT}',
          contrastColor: '#ffffff',
          hoverColor: '{customPrimary.DEFAULT}',
          activeColor: '{customPrimary.DEFAULT}',
        },
        secondary: {
          color: '{customSecondary.DEFAULT}',
          contrastColor: '#000000',
          hoverColor: '{customSecondary.DEFAULT}',
          activeColor: '{customSecondary.DEFAULT}',
        },
      },
    },
  },
  components: {
    select: {
      option: {
        selectedColor: '{primary.contrastColor}',
        selectedFocusColor: '{primary.contrastColor}',
      },
    },
    multiselect: {
      option: {
        selectedColor: '{primary.contrastColor}',
        selectedFocusColor: '{primary.contrastColor}',
      },
    },
    paginator: {
      navButton: {
        selectedBackground: '{primary.color}',
        selectedColor: '{primary.contrastColor}',
      },
    },
    datatable: {
      headerCell: {
        selectedBackground: '{primary.color}',
        selectedColor: '{primary.contrastColor}',
      },
    },
  },
});
