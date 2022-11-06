import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "../Header/Header";
import { Dashboard } from "../../features/dashboard/Home/Home";
import { FlightDays } from "../../features/flights/Days/FlightDays";
import { PlanesList } from "../../features/planes/PlanesList/Planes";
import { BatteriesList } from "../../features/batteries/BatteriesList/Batteries";
import { LocationsList } from "../../features/locations/LocationsList/Locations";
import { FlightsUpload } from "../../features/flights/Upload/FlightsUpload";
import { Container } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import createBreakpoints from "@mui/system/createTheme/createBreakpoints";

const breakpoints = createBreakpoints({});

const logbookTheme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          // less empty space when on mobile
          paddingLeft: 0,
          paddingRight: 0,

          // links have no decoration
          "& a": {
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginLeft: "0px",
          marginRight: "10px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          [breakpoints.down("md")]: {
            border: 0,
            boxShadow: "none",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          [breakpoints.down("md")]: {
            padding: 0,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          [breakpoints.down("md")]: {
            padding: 0,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          margin: 1,
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          [breakpoints.down("md")]: {
            width: "95%",
          },
        },
        content: {
          "&.Mui-expanded": {
            margin: 0,
          },
        },
      },
    },
  },
});

export const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={logbookTheme}>
          <Header />
          <Container disableGutters={true}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flights" element={<FlightDays />} />
              <Route path="/flights/:date" element={<FlightDays />} />
              <Route path="/flights/:date/:id" element={<FlightDays />} />
              <Route path="/planes" element={<PlanesList />} />
              <Route path="/planes/:id" element={<PlanesList />} />
              <Route path="/batteries" element={<BatteriesList />} />
              <Route path="/batteries/:id" element={<BatteriesList />} />
              <Route path="/locations" element={<LocationsList />} />
              <Route path="/locations/:id" element={<LocationsList />} />
              <Route path="/upload" element={<FlightsUpload />} />
              <Route path="/upload/:id" element={<FlightsUpload />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  );
};
