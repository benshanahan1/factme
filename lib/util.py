class EndpointParser:

    @staticmethod
    def parse_endpoint(url):
        ep = url.split("/")          # parse the URL
        ep = list(filter(None, ep))  # remove empty elements
        return ep