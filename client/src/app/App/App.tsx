import * as React from "react";
import { styled } from "@mui/material/styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Pages
import { Header } from "../Header/Header";
import { Dashboard } from "../../features/dashboard/Home/Home";
import { FlightDays } from "../../features/flights/Days/FlightDays";
import { PlanesList } from "../../features/planes/PlanesList/Planes";
import { BatteriesList } from "../../features/batteries/BatteriesList/Batteries";
import { LocationsList } from "../../features/locations/LocationsList/Locations";
import { FlightsUpload } from "../../features/flights/Upload/FlightsUpload";
import { Container } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import {
  createMuiTheme,
  adaptV4Theme,
  ThemeProvider,
} from "@mui/material/styles";
const PREFIX = "App";

const classes = {
  offset: `${PREFIX}-offset`,
};

const StyledBrowserRouter = styled(BrowserRouter)(({ theme }) => ({
  [`& .${classes.offset}`]: theme.mixins.toolbar,
}));

// const mobilePaddingNone = {
//   [breakpoints.down("xs")]: {
//     padding: 0,
//   },
// };

// const mobilePaddingReduced = {
//   [breakpoints.down("xs")]: {
//     padding: 10,
//   },
// };

const theme = createMuiTheme(
  adaptV4Theme({
    overrides: {
      // MuiCardHeader: { root: mobilePaddingNone },
      // MuiCardContent: { root: mobilePaddingNone },
      // MuiAccordionSummary: { root: mobilePaddingReduced },
      // MuiAccordionDetails: { root: mobilePaddingReduced },
      MuiTableCell: {
        root: {
          // less empty space when on mobile
          paddingLeft: "0.2em",
          paddingRight: "0.2em",

          // links have no decoration
          "& a": {
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          },
        },
      },
      MuiFormControl: {
        root: {
          marginLeft: "0px",
          marginRight: "10px",
        },
      },
      MuiInputBase: {
        input: {
          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            "-webkit-appearance": "none",
            margin: 0,
          },
        },
      },
    },
  })
);

export const App = () => {
  return (
    <StyledBrowserRouter basename={process.env.PUBLIC_PATH}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Header />
          <Container disableGutters={true}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flights/:date?/:id?" element={<FlightDays />} />
              <Route path="/planes/:id?" element={<PlanesList />} />
              <Route path="/batteries/:id?" element={<BatteriesList />} />
              <Route path="/locations/:id?" element={<LocationsList />} />
              <Route path="/upload/:id?" element={<FlightsUpload />} />
            </Routes>
          </Container>
        </ThemeProvider>
      </StyledEngineProvider>
    </StyledBrowserRouter>
  );
};
