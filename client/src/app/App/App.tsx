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
import { createTheme, adaptV4Theme, ThemeProvider } from "@mui/material/styles";
const PREFIX = "App";

// const classes = {
//   offset: `${PREFIX}-offset`,
// };

// const StyledBrowserRouter = styled(BrowserRouter)(({ theme }) => ({
//   [`& .${classes.offset}`]: theme.mixins.toolbar,
// }));

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

const theme = createTheme({
  components: {
    // MuiCardHeader: { root: mobilePaddingNone },
    // MuiCardContent: { root: mobilePaddingNone },
    // MuiAccordionSummary: { root: mobilePaddingReduced },
    // MuiAccordionDetails: { root: mobilePaddingReduced },
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
  },
});

export const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
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
