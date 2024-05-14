import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Select,
  SkeletonText,
  Stack,
  Text,
  layout,
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { getHistory, getRealtime } from "./services/api";
import data from "./realtime.json";

const center = { lat: 15.84021, lng: 108.39215 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDfsQIIV_h8ddv-RITKVwmavBb8Yj_W_0Y", // Config to env
    libraries: ["places"],
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [normalDirectionsResponse, setNormalDirectionsResponse] =
    useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const waypointsRef = useRef();
  // const [realtime, setRealtime] = useState(null);
  const [histories, setHistories] = useState([]);

  const startPoint = { lat: 15.8321, lng: 108.40635 }; // Hoiana

  // Prepare bus stops - Fake datas
  const busStops = [
    // {
    //   lat: 16.02363,
    //   lng: 108.25061,
    // },
    {
      location:
        "Bệnh Viện Phụ Sản - Nhi Đà Nẵng, Đường Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Da Nang, Vietnam",
    },
    {
      location:
        "Trường Đại học Kiến trúc Đà Nẵng, Núi Thành, Hòa Cường, Hòa Cường Nam, Hải Châu District, Da Nang, Vietnam",
    },
  ];

  // Get current location from api realtime - useEffect
  const currentLocation = data.result.map((item) => ({
    lat: item.lat,
    lng: item.lng,
  }));

  // Fake end point - Benh vien C17
  const endPoint = { lat: 16.05448, lng: 108.20836 };

  // Call api history
  useEffect(() => {
    const fetchHistories = async () => {
      const data = await getHistory();
      setHistories(data);
    };

    fetchHistories();
  }, []);

  if (!isLoaded) {
    return <SkeletonText />;
  }

  // Calculate route
  const handleCalculateAndDisplayRoute = async () => {
    if (originRef.current === null || destiantionRef.current === null) {
      return;
    }

    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const normalResults = await directionsService.route({
      origin: startPoint, // Start point
      waypoints: busStops,
      destination: endPoint, // End point
      optimizeWaypoints: true,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    const results = await directionsService.route({
      origin: currentLocation[0], // Start point - realtime
      waypoints: busStops,
      destination: endPoint, // End point
      // optimizeWaypoints: true,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });

    // Start point
    new google.maps.Marker({
      position: startPoint,
      map,
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", // Replace with your icon path
    });

    // Realtime point
    new google.maps.Marker({
      position: currentLocation[0],
      map,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Replace with your icon path
    });

    // Bus stops
    busStops.forEach(busStop => {
      new google.maps.Marker({
        position: busStop,
        map,
        icon: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png", // Replace with your icon path
      });
    });

    // End point
    new google.maps.Marker({
      position: endPoint,
      map,
      icon: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // Replace with your icon path
    });

    console.log("myResult", results);

    setNormalDirectionsResponse(normalResults);
    setDirectionsResponse(results);
    setDistance(normalResults.routes[0].legs[0].distance.text);
    setDuration(normalResults.routes[0].legs[0].duration?.text);
  };

  const handleClearRoute = () => {
    setDirectionsResponse(null);
    setNormalDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destiantionRef.current.value = "";
  };

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={13}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{ suppressMarkers: true }}
            />
          )}
          {normalDirectionsResponse && ( // Draw path from start to end
            <DirectionsRenderer
              directions={normalDirectionsResponse}
              options={{ suppressMarkers: true }}
            />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <Select placeholder="Choose route" mb={15}>
          <option value="hoianaToDaNang">Hoiana - Da Nang</option>
          <option value="hoianaToTamKy">Hoiana - Tam Ky</option>
          <option value="hoianaToHoiAn">Hoiana - Hoi An</option>
        </Select>
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Origin - Realtime"
                ref={originRef}
              />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Stack>
                <Select
                  size="lg"
                  ref={waypointsRef}
                  placeholder="Select bus stop"
                >
                  {busStops.map((busStop, index) => (
                    <option key={index} value={busStop.location}>
                      {busStop.location}
                    </option>
                  ))}
                </Select>
              </Stack>
            </Autocomplete>
          </Box>
          <ButtonGroup>
            <Button
              colorScheme="blue"
              type="submit"
              onClick={handleCalculateAndDisplayRoute}
            >
              Calculate Route
            </Button>
            <IconButton
              aria-label="center back"
              icon={<FaTimes />}
              onClick={handleClearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(currentLocation[0]);
              map.setZoom(14);
            }}
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
